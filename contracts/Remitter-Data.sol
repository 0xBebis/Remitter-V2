// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Remitter_Data {

  IERC20 public immutable native;

  // money that needs to be paid out or received
  uint public totalPayroll;
  uint public totalPendingCredits;
  uint public totalPendingDebits;

  // money paid out or received
  uint public totalCredits;
  uint public totalDebits;
  uint public totalWorkers;

  /*
   | @dev represents any party that will be paid by the remitter
   | @property name - the reference name for this contractor
   | @property wallet - the wallet address for this contractor
   | @property perCycle - the amount this contractor will be owed each cycle
   | @property startingCycle - the cycle which this person will receive their first payment.
   | @property cyclesPaid - the amount of payments that have been accounted for since the starting cycle.
  */

  struct Contractor {
    string name;
    address wallet;
    uint perCycle;
    uint startingCycle;
    uint cyclesPaid;
  }

  struct PaymentPlan {
    uint debt;
    uint paid;
    uint perCycle;
  }

  //TODO: events are inherently linked to a timestamp - is time parameter necessary?
  event NewCredit(address indexed caller, uint indexed contractorId, uint time, uint amount);
  event NewDebit(address indexed caller, uint indexed contractorId, uint time, uint amount);
  event AdvanceCycle(uint indexed cycleCount, uint credits, uint debits, uint workers);

  /*
   | @dev iterable mapping of contractors to their IDs
   | @key nonce at the time the contractor is added to the system - their ID
  */

  uint public maxSalary;
  mapping(uint => Contractor) public contractors;
  mapping(uint => PaymentPlan) public paymentPlans;
  mapping(uint => mapping(address => bool)) public authorizedWallet;
  mapping(address => uint) public getId;

  uint cycleCount;

  // from user POV
  mapping(uint => uint) internal creditsToUser;
  mapping(uint => uint) internal debitsToUser;

  /*
   | @dev authorized payments
   |
   |
  */

  uint public defaultAuth;
  mapping(uint => uint) public oneTimeAuth;
  mapping(uint => uint) public addedCredits;
  mapping(uint => uint) public lastCycleAdded;

  mapping(address => bool) public isAdmin;
  mapping(address => bool) public isSuperAdmin;

  constructor(address _native, uint _defaultAuth, uint _maxSalary) {
    native = IERC20(_native);
    defaultAuth = _defaultAuth;
    maxSalary = _maxSalary;
    isSuperAdmin[msg.sender] = true;
  }
}
