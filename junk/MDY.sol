pragma solidity ^0.8.0;

contract MDY {

  uint JAN_1_2022 = 1641013200;
  uint ONE_DAY = 86400;
  uint ONE_YEAR = 365 days;
  uint leapYearCounter = 2;

  uint JAN = 31 days;
  uint FEB = 28 days;
  uint MAR = 31 days;
  uint APR = 30 days;
  uint MAY = 31 days;
  uint JUN = 30 days;
  uint JUL = 31 days;
  uint AUG = 31 days;
  uint SEP = 30 days;
  uint OCT = 31 days;
  uint NOV = 30 days;
  uint DEC = 31 days;

  uint[] month = [ JAN, FEB, MAR, APR, MAY, JUN, JUL, AUG, SEP, OCT, NOV, DEC ];

  function getMonth() internal returns (Month) {
    uint n = checkYear();
    uint i;
    while (n > 0) {
      n -= month[i];
    }
  }

  function getPayDay() internal returns (uint) {

  }

  function checkYear() internal returns (uint) {
    uint elapsed = block.timestamp - JAN_1_2022;
    uint passed = elapsed / oneYear();
    if (passed / 4 == 0) {
      FEB = 29 days;
      return 366 days;
    } else {
      return 365 days;
    }
  }

}
