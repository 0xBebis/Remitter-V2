// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Remitter_Data {

  IERC20 public immutable native;

  uint public immutable startTime;

  // money that needs to be paid out or received
  uint public totalPayroll;
  uint public totalPendingCredits;
  uint public totalPendingDebits;

  // money paid out or received
  uint public totalCredits;
  uint public totalDebits;
  uint public totalWorkers;

  struct Cycle {
    uint credits;
    uint debits;
    uint workers;
  }

  /*
   | @dev Credit to the organization's account
   | @property payor - person paying the remitter contract
   | @property time - time payment was received
   | @property amount - amount of money received
  */
  struct Credit {
    address payor;
    uint contractorId;
    uint time;
    uint amount;
  }

  /*
   | @dev Debit to the organization's account
   | @property payee - person the remitter contract is paying
   | @property time - time payment was allocated
   | @property amount - amount of money allocated
  */
  struct Debit {
    address payee;
    uint contractorId;
    uint time;
    uint amount;
  }

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
    uint perCycle;
    uint startingCycle;
    uint paid;
  }

  event newCredit(address indexed caller, uint contractorId, uint time, uint amount);
  event newDebit(address indexed caller, uint contractorId, uint time, uint amount);

  /*
   | @dev iterable mapping of contractors to their IDs
   | @key nonce at the time the contractor is added to the system - their ID
  */

  uint public nonce;
  uint public maxSalary;
  mapping(uint => Contractor) public contractors;
  mapping(uint => PaymentPlan) public paymentPlans;
  mapping(uint => mapping(address => bool)) public authorizedWallet;
  mapping(address => uint) public getId;

  uint cycleCount;
  mapping (uint => Cycle) public cycleSnapshots;

  // from user POV
  mapping(uint => uint) internal creditsToUser;
  mapping(uint => uint) internal debitsToUser;

  /*
   | @dev all credits and debits mapped to contractorId keys
   |
   |
  */
  Credit[] public allCredits;
  Debit[] public allDebits;
  mapping(uint => Credit[]) public userCredits;
  mapping(uint => Debit[]) public userDebits;

  /*
   | @dev authorized payments
   |
   |
  */

  // NOTE: INITIALIZE ON CONSTRUCTION AND UPDATE
  uint public defaultAuth;
  mapping(uint => uint) public oneTimeAuth;

  mapping(address => bool) public isAdmin;
  mapping(address => bool) public isSuperAdmin;

  constructor(address _native, uint _startTime, uint _defaultAuth) {
    native = IERC20(_native);
    startTime = _startTime;
    defaultAuth = _defaultAuth;
    isSuperAdmin[msg.sender] = true;
  }
}
