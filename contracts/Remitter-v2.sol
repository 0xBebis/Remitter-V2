// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "./Remitter-Data.sol";

contract Remitterv2 is Remitter_Data {

  using SafeERC20 for IERC20;

  constructor(
    address native,
    uint defaultAuth,
    uint maxSalary
  ) Remitter_Data(native, defaultAuth, maxSalary) {
    isSuperAdmin[msg.sender] = true;
  }

  /*
   | @dev admin function to add credit directly to contractor account
   | @param contractorId idenfication number of contractor
   | @param amount quantity of tokens to add
  */
  function addCredit(uint contractorId, uint amount) external {
    onlyAdmin();
    require(contractors[contractorId].wallet != address(0), "contractor does not exist");

    uint totalAmount;
    uint _cycleCount = cycleCount;
    if (_cycleCount == lastCycleAdded[contractorId]) {
      totalAmount = amount + addedCredits[contractorId];
      require(totalAmount <= checkAuthorization(contractorId), "payment too large, seek authorization");
      addedCredits[contractorId] += amount;
    } else {
      totalAmount = amount;
      require(totalAmount <= checkAuthorization(contractorId), "payment too large, seek authorization");
      lastCycleAdded[contractorId] = _cycleCount;
      addedCredits[contractorId] = amount;
    }
    if (totalAmount > defaultAuth && oneTimeAuth[contractorId] != 0) {
      delete oneTimeAuth[contractorId];
    }

    _incrementPendingCredits(contractorId, amount);
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
  function payCredit(uint contractorId, uint amount) external {
    _updateCredits(contractorId, amount);
    native.safeTransferFrom(msg.sender, address(this), amount);
  }

  function getPaid() external {
    uint id = getId[msg.sender];
    _sendPayment(id, msg.sender, maxPayable(id));
  }

  function payTo(uint contractorId) external {
    require(authorizedWallet[contractorId][msg.sender], "wallet not authorized");
    _sendPayment(contractorId, contractors[contractorId].wallet, maxPayable(contractorId));
  }

  /*
   | @dev function to send money from Remitter to contractor's approved wallet
   | @param contractorId - idenfication number of contractor
   | @param to - wallet to receive amount
   | @param amount - quantity of tokens to send
  */
  function sendPayment(uint contractorId, address to, uint amount) external {
    ownerOrAdmin(contractorId);
    require(to != address(0), "transfer to zero address");
    require(authorizedWallet[contractorId][to], "not authorized to receive payment for this ID");
    require(maxPayable(contractorId) >= amount, "not enough credit");
    _sendPayment(contractorId, to, amount);
  }

  function _sendPayment(uint contractorId, address to, uint amount) internal {
    _updateDebits(contractorId, amount);
    native.safeTransfer(to, amount);
  }

  /*
   | @dev function to check maximum authorized credit for contractor
   | @param contractorId - idenfication number of contractor
   | @return - maximum credit authorized for contractor
  */
  function checkAuthorization(uint contractorId) public view returns (uint) {
    return Math.max(defaultAuth, oneTimeAuth[contractorId]);
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

  function updateState(uint[] calldata contractorIds) external {
    onlyAdmin();
    for (uint i = 0; i < contractorIds.length; i++) {
      _updateState(contractorIds[i]);
    }
  }

  function _updateState(uint contractorId) internal {
    _updateOwed(contractorId);
    _settleAccounts(contractorId);
  }

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
    emit NewCredit(msg.sender, contractorId, amount);
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
    emit NewDebit(msg.sender, contractorId, amount);
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
   | @dev balances credits and debits, ensuring the remitter remains solvent
   | @param contractorId - idenfication number of contractor
  */
  function _settleAccounts(uint contractorId) internal {
    (uint credits, uint debits) = _checkBalances(contractorId);
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
  }

  /*
  | @dev returns current credits and debits to contractor's account
  | @param contractorId - idenfication number of contractor
  */
  function _checkBalances(uint contractorId) internal view returns (uint credit, uint debit) {
    return(creditsToUser[contractorId], debitsToUser[contractorId]);
  }

  /*
  | @dev returns credit available to contractor, ignoring owed salary
  | @param contractorId - idenfication number of contractor
  */
  function _surplusCredit(uint contractorId) internal view returns (uint) {
    (uint credit, uint debit) = _checkBalances(contractorId);
    if (credit > debit) {
      return credit - debit;
    } else {
      return 0;
    }
  }

  /*
  | @dev returns current maximum amount payable to a contractor
  | @param contractorId - idenfication number of contractor
  */
  function maxPayable(uint contractorId) public view returns (uint) {
    (uint owed, ) = owedSalary(contractorId);
    return _surplusCredit(contractorId) + owed;
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
  */
  function _updateOwed(uint contractorId) internal {
    (uint salaryOwed, uint cyclesOwed) = owedSalary(contractorId);
    if(salaryOwed != 0) {
      _incrementPendingCredits(contractorId, salaryOwed);
    }
    if (cyclesOwed != 0) {
      contractors[contractorId].cyclesPaid += cyclesOwed;
    }
  }

  /*
  | @dev check the amount of money owed to the contractor via salary
  | @param contractorId - idenfication number of contractor
  | @return - credit owed to contractor via salary
  */
  function owedSalary(uint contractorId) public view returns (uint, uint) {
    Contractor storage contractor = contractors[contractorId];
    uint cyclesOwed = cycleCount - contractor.startingCycle - contractor.cyclesPaid;
    return ((cyclesOwed * contractor.perCycle), cyclesOwed);
  }

  /*
   | @dev registers a new payee to the system
   | @param contractorId - this contractor's id
   | @param name - the reference name for this contractor
   | @param walletAddress - the wallet address for this contractor
   | @param perCycle - the amount this contractor will be owed each cycle
   | @param startingCycle - the cycle which this person will receive their first payment.
   |                           this is only relevant for people receiving regular payments - set to 0 otherwise.
  */
  function addContractor(
    string memory name,
    address walletAddress,
    uint perCycle,
    uint startingCycle
  ) external {
    onlySuperAdmin();
    uint contractorId = ++nonce;
    Contractor storage contractor = contractors[contractorId];

    _changeWallet(contractorId, walletAddress);
    contractor.name = name;
    contractor.startingCycle = startingCycle;
    contractor.perCycle = perCycle;

    totalPayroll += perCycle;
    totalWorkers++;

    emit AddContractor(contractorId, walletAddress, name, startingCycle, perCycle);
  }

  function terminateContractor(uint contractorId) external {
    onlyAdmin();
    uint256 amount = maxPayable(contractorId);
    _updateDebits(contractorId, amount);

    Contractor storage contractor = contractors[contractorId];

    totalWorkers--;
    totalPayroll -= contractor.perCycle;

    delete contractor.perCycle;
    delete getId[contractor.wallet];
    delete contractor.wallet;

    emit TerminateContractor(contractorId);

    native.safeTransfer(contractors[contractorId].wallet, amount);
  }

  /*
   | @dev changes the contractor's reference name
   | @param contractorId - id number for the contracter whose name you'd like to change
   | @param newName - the new name you'd like to assign to the contractor
  */
  function changeName(uint contractorId, string memory newName) external {
    ownerOrAdmin(contractorId);
    contractors[contractorId].name = newName;
  }

  /*
   | @dev changes the contractor's primary wallet - does NOT deauthorize the old wallet
   | @param contractorId - id number for the contracter whose name you'd like to change
   | @param newWallet - the new wallet you'd like to assign to the contractor
  */
  function changeWallet(uint contractorId, address newWallet) external {
    ownerOrSuperAdmin(contractorId);
    require(newWallet != address(0), "changing wallet to zero address");
    delete getId[contractors[contractorId].wallet];
    _changeWallet(contractorId, newWallet);
    emit ChangeWallet(contractorId, newWallet);
  }

  function _changeWallet(uint contractorId, address newWallet) internal {
    contractors[contractorId].wallet = newWallet;
    getId[newWallet] = contractorId;
    authorizedWallet[contractorId][newWallet] = true;
  }

  function changeSalary(uint contractorId, uint newSalary) external {
    onlyAdmin();
    require(newSalary <= maxSalary, "new salary is higher than maximum");
    require(contractors[contractorId].wallet != address(0), "contractor does not exist or was terminated");
    uint oldSalary = contractors[contractorId].perCycle;
    if (oldSalary < newSalary) {
      totalPayroll += newSalary - oldSalary;
    } else {
      totalPayroll -= oldSalary - newSalary;
    }
    contractors[contractorId].perCycle = newSalary;
    emit ChangeSalary(contractorId, newSalary);
  }

  /*
   | @dev changes the user's starting payment cycle - used to program breaks in the user's work
   | @param contractorId - id number for the contracter whose name you'd like to change
   | @param name - the new base period for the contractor
  */
  function changeStartingCycle(uint contractorId, uint newStart) external {
    ownerOrAdmin(contractorId);
    require(newStart >= cycleCount, "cannot start earlier than current time");

    uint256 amount = maxPayable(contractorId);
    _updateDebits(contractorId, amount);

    Contractor storage contractor = contractors[contractorId];
    contractor.startingCycle = newStart;
    contractor.cyclesPaid = 0;

    emit ChangeStartingCycle(contractorId, newStart);

    native.safeTransfer(contractor.wallet, amount);
  }

  function authorizeAgent(uint contractorId, address walletAddress, bool authorize) external {
    ownerOrSuperAdmin(contractorId);
    authorizedWallet[contractorId][walletAddress] = authorize;
    emit AuthorizeWallet(contractorId, walletAddress, authorize);
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

  function ownerOrSuperAdmin(uint contractorId) internal view {
    require(isSuperAdmin[msg.sender] || authorizedWallet[contractorId][msg.sender],
      "caller cannot perform this action");
  }

  function advanceCycle() external {
    onlySuperAdmin();
    emit AdvanceCycle(cycleCount++, totalCredits, totalDebits, totalWorkers);
  }

  function setDefaultAuth(uint _defaultAuth) external {
    onlySuperAdmin();
    defaultAuth = _defaultAuth;
  }

  function setMaxSalary(uint _maxSalary) external {
    onlySuperAdmin();
    maxSalary = _maxSalary;
  }

  function setAdmin(address walletAddress, bool _isAdmin) external {
    onlySuperAdmin();
    isAdmin[walletAddress] = _isAdmin;
    emit AdminChanged(walletAddress, _isAdmin);
  }

  function setSuperAdmin(address walletAddress, bool _isSuperAdmin) external {
    onlySuperAdmin();
    isSuperAdmin[walletAddress] = _isSuperAdmin;
    emit SuperAdminChanged(walletAddress, _isSuperAdmin);
  }

  function rescueLostTokens(address token, address to, uint256 amount) external {
    onlySuperAdmin();
    require(token != address(native), "cannot bypass native token accounting");
    if (token == address(0)) {
      payable(to).transfer(amount);
    } else {
      IERC20(token).safeTransfer(to, amount);
    }
  }
}
