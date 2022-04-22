## Byte Masons Salary Manager
### Use this contract to simplify paying a big team or many people

Superadmin will ideally be a multisig or governance contract, and manages global state & admin privs.
Currency is the address of the currency you're paying people in.
MaxSalary is used to mitigate the amount of damage the admin can do.
firstPayDay is (in UNIX timestamp) the first day you're paying people. the contract will automatically set the start time to one cycle before.
Default cycle is 15 days but it can be whatever.
Total Payroll helps the DAO know how much to fund the contract.

All payments are logged in the payments mapping to serve up to employees.
workerId is logged with the default wallet for convenience' sake so we can reference the connected wallet from the front end.

The reason for making this contract is reducing the amount of multisig/governance transactions we need to pay people. We just need to fund the payment contract every pay cycle for totalPayroll.

It would be pretty easy to just make the cycles one second and make a streaming contract, but you'd need to divide the salaries by however many seconds
