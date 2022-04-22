// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "./Remitter-Data.sol";

contract Remitterv2 is Remitter_Data {

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address native, uint start) Remitter_Data(native, start) {}

    /*
     | @dev admin function to add credit directly to contractor account
     | @param contractorId idenfication number of contractor
     | @param amount quantity of tokens to add
    */
    function addCredit(uint contractorId, uint amount) external {
      onlyAdmin();
      require(contractors[contractorId].wallet != address(0), "contractor does not exist");
      require(amount <= checkAuthorization(contractorId), "payment too large, seek authorization");
      if (oneTimeAuth[contractorId] > 0 && amount > defaultAuth) {
        oneTimeAuth[contractorId] = 0;
      }
      _updateCredits(contractorId, amount);
    }

    /*
     | @dev admin function to add debit directly to contractor account
     | @param contractorId - idenfication number of contractor
     | @param amount - quantity of tokens to add
    */
    function addDebit(uint contractorId, uint amount) external {
      onlyAdmin();
      require(contractors[contractorId].wallet != address(0), "contractor does not exist");
      _updateDebits(contractorId, amount);
    }

    /*
     | @dev contractor function to add credit to an account (contractorId) by sending money
     | @param contractorId - idenfication number of contractor
     | @param amount - quantity of tokens to pay
    */
    function payCredit(uint contractorId, uint amount) public {
      native.transferFrom(msg.sender, address(this), amount);
      _updateCredits(contractorId, amount);
    }

    //todo: add wallet auth

    /*
     | @dev contractor function to receive money from Remitter to approved wallet
     | @param contractorId - idenfication number of contractor
     | @param amount - quantity of tokens to receive
    */
    function pullPayment(uint contractorId, uint amount) public {
      require(authorizedWallet[contractorId][msg.sender], "not authorized to receive payment for this ID");
      require((realCredit(contractorId) + owed(contractorId)) >= amount, "not enough credit");
      _updateDebits(contractorId, amount);
      native.transfer(msg.sender, amount);
    }

    /*
     | @dev admin function to send money from Remitter to contractor's approved wallet
     | @param contractorId - idenfication number of contractor
     | @param to - wallet to receive amount
     | @param amount - quantity of tokens to send
    */
    function pushPayment(uint contractorId, address to, uint amount) public {
      onlyAdmin();
      require(authorizedWallet[contractorId][to], "not authorized to receive payment for this ID");
      require((realCredit(contractorId) + owed(contractorId)) >= amount, "not enough credit");
      _updateDebits(contractorId, amount);
      native.transfer(to, amount);
    }

    //todo - add debt tracking

    /*
     | @dev admin function to create a pay-by-cycle plan for the contractor
     |      Will restructure a contractor's existing payment plan to conform to
     |      "cycles"
     | @param contractorId - idenfication number of contractor
     | @param amount - quantity of debt to add
     | @param cycles - amount of time to expect full payment
    */
    function addPaymentPlan(uint contractorId, uint amount, uint cycles) external {
      onlyAdmin();
      require(contractors[contractorId].wallet != address(0), "contractor does not exist");
      PaymentPlan storage plan = paymentPlans[contractorId];
      uint total = plan.debt - plan.paid + amount;
      plan.debt += amount;
      plan.perCycle += (total / cycles);
      plan.startingCycle = cycleCount;
    }

    // todo add per-cycle tracking to ensure defaultAuth isn't abused

    /*
     | @dev function to check maximum authorized credit for contractor
     | @param contractorId - idenfication number of contractor
     | @return - maximum credit authorized for contractor
    */
    function checkAuthorization(uint contractorId) public view returns (uint) {
      uint _oneTimeAuth = oneTimeAuth[contractorId];
      return Math.max(defaultAuth, _oneTimeAuth);
    }

    /*
    | @dev function to allow an addition of credit over defaultAuth.
    |      Used to prevent human error, compromised keys, or rogue admins.
    | @param contractorId - idenfication number of contractor
    | @param amount - amount of credit to authorize
    */
    function addAuthorizedPayment(uint contractorId, uint amount) external {
      onlySuperAdmin();
      oneTimeAuth[contractorId] += amount;
    }

    /*
     + CORE ACCOUNTING FUNCTIONS
     + These functions are designed to update one side of the ledger at a time,
     + then balance everything out with the _settleAccounts function.
     + This way, payments are properly logged on each side of the ledger,
     + and zero sum behavior should be achieved without needing to perform
     + too many operations within high-level functions.
    */

    /*
     | @dev core accounting function - adds credits to contractor's account,
     |      updates global state, updates credits & debits based on salaries
     |      and payment plans, and then balances contractor's account.
     | @param contractorId - idenfication number of contractor
     | @param amount - amount of credit to add to contractor's account
    */
    function _updateCredits(uint contractorId, uint amount) internal {
      _incrementPendingCredits(contractorId, amount);
      _updateOwed(contractorId);
      _settleAccounts(contractorId);
      emit newCredit(msg.sender, contractorId, block.timestamp, amount);
    }

    /*
    | @dev core accounting function - adds credits to contractor's account,
    |      updates global state, updates credits & debits based on salaries
    |      and payment plans, and then balances contractor's account.
    | @param contractorId - idenfication number of contractor
    | @param amount - amount of debit to add to contractor's account
    */
    function _updateDebits(uint contractorId, uint amount) internal {
      _incrementPendingDebits(contractorId, amount);
      _updateOwed(contractorId);
      _settleAccounts(contractorId);
      emit newDebit(msg.sender, contractorId, block.timestamp, amount);
    }

    /*
    | @dev updates state when a credit is added to the system
    | @param contractorId - idenfication number of contractor
    | @param amount - amount of credit to add
    */
    function _incrementPendingCredits(uint contractorId, uint amount) internal {
      creditsToUser[contractorId] += amount;
      totalPendingCredits += amount;
      totalCredits += amount;
    }

    /*
    | @dev updates state when a debit is added to the system
    | @param contractorId - idenfication number of contractor
    | @param amount - amount of debit to add
    */
    function _incrementPendingDebits(uint contractorId, uint amount) internal {
      debitsToUser[contractorId] += amount;
      totalPendingDebits += amount;
      totalDebits += amount;
    }

    /*
    | @dev returns credit available to contractor, ignoring owed
    | @param contractorId - idenfication number of contractor
    */
    function realCredit(uint contractorId) public view returns (uint) {
      (uint credit, uint debit) = checkBalances(contractorId);
      if (credit > debit) {
        return credit - debit;
      } else {
        return 0;
      }
    }

    /*
    | @dev returns debits pending for contractor, ignoring owed
    | @param contractorId - idenfication number of contractor
    */
    function realDebit(uint contractorId) public view returns (uint) {
      (uint credit, uint debit) = checkBalances(contractorId);
      if (credit < debit) {
        return debit - credit;
      } else {
        return 0;
      }
    }

    /*
     | @dev balances credits and debits, ensuring the remitter remains solvent
     | @param contractorId - idenfication number of contractor
     | @return credit - contractor credit after settlement
     | @return debit - contractor debit after settlement
    */

    function _settleAccounts(uint contractorId) internal returns (uint credit, uint debit) {
      (uint credits, uint debits) = checkBalances(contractorId);
      if (credits > debits) {
        totalPendingCredits -= (credits - debits);
        totalPendingDebits -= debits;
        _updateBalances(contractorId, credits - debits, 0);
      } else if (credits < debits) {
        totalPendingCredits -= credits;
        totalPendingDebits -= (debits - credits);
        _updateBalances(contractorId, 0, debits - credits);
      } else {
        totalPendingCredits -= credits;
        totalPendingDebits -= debits;
        _updateBalances(contractorId, 0, 0);
      }
      return checkBalances(contractorId);
    }

    /*
    | @dev returns current credits and debits to contractor's account
    | @param contractorId - idenfication number of contractor
    */
    function checkBalances(uint contractorId) public view returns (uint credit, uint debit) {
      return(creditsToUser[contractorId], debitsToUser[contractorId]);
    }

    /*
    | @dev updates credits and debits for contractor's account, bypassing state updates
    | @param contractorId - idenfication number of contractor
    | @param newCredits - new credit value for user
    | @param newDebits - new debit value for user
    */
    function _updateBalances(uint contractorId, uint newCredits, uint newDebits) internal {
      creditsToUser[contractorId] = newCredits;
      debitsToUser[contractorId] = newDebits;
    }

    /*
    | @dev update the credits and debits for user based on salary & payment plan
    | @param contractorId - idenfication number of contractor
    | @return - contractor's current credit
    */
    function _updateOwed(uint contractorId) internal returns (uint) {
      (uint salaryOwed, uint cyclesOwed) = owedSalary(contractorId);
      if(salaryOwed > 0) {
        _incrementPendingCredits(contractorId, owedPayments(contractorId));
        contractors[contractorId].cyclesPaid += cyclesOwed;
      }

      if (owedPayments(contractorId) > 0) {
        _incrementPendingDebits(contractorId, owedPayments(contractorId));
      }
      return realCredit(contractorId);
    }

    /*
    | @dev check the amount of money owed to the contractor via salary after payments are removed
    | @param contractorId - idenfication number of contractor
    | @return - credit owed to contractor, which will be added on next state update
    */
    function owed(uint contractorId) public view returns (uint) {
      (uint moneyOwed,) = owedSalary(contractorId);
      return moneyOwed - owedPayments(contractorId);
    }

    /*
    | @dev check the amount of money owed to the contractor via salary
    | @param contractorId - idenfication number of contractor
    | @return - credit owed to contractor via salary
    */
    function owedSalary(uint contractorId) public view returns (uint, uint) {
      Contractor memory contractor = contractors[contractorId];
      uint cyclesOwed = cycleCount - contractor.startingCycle - contractor.cyclesPaid;
      return ((cyclesOwed * contractor.perCycle), cyclesOwed);
    }

    /*
    | @dev check the amount of money owed by contractor via payment plan
    | @param contractorId - idenfication number of contractor
    | @return - debit owed by contractor before salary
    */
    function owedPayments(uint contractorId) public view returns (uint) {
      PaymentPlan storage plan = paymentPlans[contractorId];
      if (plan.debt > plan.paid) {
        uint total = plan.debt - plan.paid;
        return Math.min(total, plan.perCycle);
      } else {
        return 0;
      }
    }

    /*
     | @dev registers a new payee to the system
     | @param _name - the reference name for this contractor
     | @param _wallet_address - the wallet address for this contractor
     | @param _base_hourly_rate - the amount this contractor is paid per hour
     | @param _base_period - the amount of hours this contractor is expected to work per pay period
     | @param _starting_cycle - the cycle which this person will receive their first payment.
     |                           this is only relevant for people receiving regular payments - set to 0 otherwise.
     | @return contractorId - this contractor's id
    */
    function addContractor(
      uint contractorId,
      string memory name,
      address walletAddress,
      uint perCycle,
      uint startingCycle
    ) public {
      onlyAdmin();
      require(contractors[contractorId].wallet == address(0), "ID is already taken");
      changeName(contractorId, name);
      changeWallet(contractorId, walletAddress);
      changeSalary(contractorId, perCycle);
      changeStartingCycle(contractorId, startingCycle);
    }
    /*
     | @dev changes the contractor's reference name
     | @param contractorId - id number for the contracter whose name you'd like to change
     | @param newName - the new name you'd like to assign to the contractor
    */
    function changeName(uint contractorId, string memory newName) public {
      ownerOrAdmin(contractorId);
      contractors[contractorId].name = newName;
    }

    function changeWallet(uint contractorId, address newWallet) public {
      ownerOrAdmin(contractorId);
      require(newWallet != address(0), "changing wallet to zero address");
      contractors[contractorId].wallet = newWallet;
    }

    function changeSalary(uint contractorId, uint newSalary) public {
      onlyAdmin();
      require(newSalary <= maxSalary, "new salary is higher than maximum");
      contractors[contractorId].perCycle = newSalary;
    }

    function changeHourly(uint contractorId, uint newRate) public {
      onlyAdmin();
      contractors[contractorId].hourlyRate = newRate;
    }

    //TODO: pay out current before update

    /*
     | @dev changes the user's starting payment cycle - used to program breaks in the user's work
     | @param contractorId - id number for the contracter whose name you'd like to change
     | @param name - the new base period for the contractor
    */
    function changeStartingCycle(uint contractorId, uint newStart) public {
      ownerOrAdmin(contractorId);
      require(newStart >= cycleCount, "cannot start earlier than current time");
      _updateOwed(contractorId);
      contractors[contractorId].startingCycle = newStart;
      contractors[contractorId].cyclesPaid = 0;
    }

    function authorizeAgent(uint contractorId, address walletAddress) public {
      ownerOrAdmin(contractorId);
      authorizedWallet[contractorId][walletAddress] = true;
    }

    function onlyAdmin() internal view {
      require(isAdmin[msg.sender] || isSuperAdmin[msg.sender], "not admin or super admin");
    }

    function onlySuperAdmin() internal view {
      require(isSuperAdmin[msg.sender], "not super admin");
    }

    function ownerOrAdmin(uint contractorId) internal view {
      require(isAdmin[msg.sender] || isSuperAdmin[msg.sender] || authorizedWallet[contractorId][msg.sender],
        "caller cannot perform this action");
    }

    function advanceCycle() external {
      onlyAdmin();
      cycleCount++;
      //_advanceCycle();
    }

  /*  function rescueLostTokens(address token, address to, uint256 amount) public onlyRole(RESCUER_ROLE){
    	IERC20Upgradeable(token).transfer(to, amount);
    }
*/
}
