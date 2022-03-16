import { ethers } from "hardhat";
import { Contract, Signer, BigNumber } from "ethers";
import { expect } from "chai";


const zero = '0x0000000000000000000000000000000000000000';

describe("METACONCERT", function(){

	let mock : Contract;

	let caller : Signer;
	let sender : Signer;
	let recipient : Signer;
	let spender : Signer;
	let burner : Signer;
	let locked : Signer;
	let others : Signer[];
	let accounts : Signer[];

	beforeEach(async function(){
		accounts = await ethers.getSigners();
		[caller, sender, recipient, spender, locked, ...others] = accounts;
	});

	describe("#constructor()", async function(){
		it("should mint initial_supply * (10**18) to msg.sender", async function(){
			const callerAddr = await caller.getAddress();
			const Factory = await ethers.getContractFactory("METACONCERT");
			const initial = BigNumber.from(5000000000);
			const exp = BigNumber.from("10").pow(18);
			mock = await Factory.deploy(); 
			await expect(await mock.balanceOf(callerAddr)).to.equal(initial.mul(exp));
		});
	});

	describe("#transfer()", async function(){
		it("should be reverted by zero address", async function(){
			const Factory = await ethers.getContractFactory("METACONCERT");
			mock = await Factory.deploy(); 
			await expect(mock.transfer(zero,1)).to.be.reverted;
		});
		it("should increase recipient's balance", async function(){
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("METACONCERT");
			mock = await Factory.deploy(); 
			await expect(await mock.balanceOf(recipientAddr)).to.equal(0);
			await mock.transfer(recipientAddr,1);
			await expect(await mock.balanceOf(recipientAddr)).to.equal(1);
		});
	});

	describe("#transferFrom()", async function(){
		it("should be reverted by zero address", async function(){
			const callerAddr = await caller.getAddress();
			const Factory = await ethers.getContractFactory("METACONCERT");
			mock = await Factory.deploy(); 
			await expect(mock.transferFrom(callerAddr,zero,1)).to.be.reverted;
		});
		it("caller's balance should be changed after transferFrom()", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("METACONCERT");
			mock = await Factory.deploy(); 
			await mock.transfer(recipientAddr,10);
			const balanceCaller = await mock.balanceOf(callerAddr);
			await mock.connect(recipient).approve(callerAddr,10);
			await mock.transferFrom(recipientAddr,callerAddr,1);
			await expect(await mock.balanceOf(callerAddr)).to.not.equal(balanceCaller);
		});
	});

	describe("#approve()", async function(){
		it("should be reverted", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("METACONCERT");
			mock = await Factory.deploy(); 
			await expect(mock.approve(zero,10)).to.be.reverted;
		});

		it("should be changed 0 to amount", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("METACONCERT");
			mock = await Factory.deploy(); 
			await expect(await mock.allowance(callerAddr,recipientAddr)).to.equal(0);
			await mock.approve(recipientAddr, 100);
			await expect(await mock.allowance(callerAddr,recipientAddr)).to.equal(100);
		});
	});

	describe("#name()", async function(){
		it("should return name, META CONCERT", async function(){
			const Factory = await ethers.getContractFactory("METACONCERT");
			mock = await Factory.deploy(); 
			await expect(await mock.name()).to.equal("META CONCERT");
		});
	});

	describe("#symbol()", async function(){
		it("should return symbol, MECO", async function(){
			const Factory = await ethers.getContractFactory("METACONCERT");
			mock = await Factory.deploy(); 
			await expect(await mock.symbol()).to.equal("MECO");
		});
	});

	describe("#decimals()", async function(){
		it("should return integer, 18", async function(){
			const Factory = await ethers.getContractFactory("METACONCERT");
			mock = await Factory.deploy(); 
			await expect(await mock.decimals()).to.equal(18);
		});
	});
});

describe("ERC20", function(){

	let mock : Contract;

	let caller : Signer;
	let sender : Signer;
	let recipient : Signer;
	let spender : Signer;
	let burner : Signer;
	let locked : Signer;
	let others : Signer[];
	let accounts : Signer[];

	beforeEach(async function(){
		accounts = await ethers.getSigners();
		[caller, sender, recipient, spender, locked, ...others] = accounts;
	});

	describe("#Transfer event", async function(){
		it("should be emitted Transfer event", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy(); 
			await expect(await mock.balanceOf(recipientAddr)).to.equal(0);
			await expect(mock._transferTest(callerAddr, recipientAddr,100)).to.emit(mock,"Transfer");
		});
	});

	describe("#Approval", async function(){
		it("should be emitted Approval event", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy(); 
			await expect(mock._approveTest(callerAddr,recipientAddr,100)).to.emit(mock,"Approval");
			
		});
	});
	
	describe("#_transfer()",  async function(){
		it("recipient's balance should be changed", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy(); 
			await expect(await mock.balanceOf(recipientAddr)).to.equal(0);
			await mock._transferTest(callerAddr, recipientAddr,100);
			await expect(await mock.balanceOf(recipientAddr)).to.equal(100);
					
		});
	});

	describe("#_approve()", async function(){
		it("allowance should be setted to amount", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy(); 
			await expect(await mock.allowance(callerAddr,recipientAddr)).to.equal(0);
			await mock._approveTest(callerAddr,recipientAddr,100);
			await expect(await mock.allowance(callerAddr,recipientAddr)).to.equal(100);
		});
	});

	describe("#_mint()", async function(){
		it("totalSupply should be increased", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy(); 
			const pretotal = await mock.totalSupply();
			await mock._mintTest(recipientAddr,100);
			await expect(await mock.totalSupply()).to.not.equal(pretotal);
		});
	});

	describe("#_burn()", async function(){
		it("burned addres's balance should be decrease", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy(); 
			const callerBal = await mock.balanceOf(callerAddr);
			await mock._burnTest(callerAddr,100);
			await expect(await mock.balanceOf(callerAddr)).to.not.equal(callerBal);
			
		});

	});

	describe("#totalSupply()", async function(){
		it("should return totalSupply", async function(){
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy(); 
			const initial = BigNumber.from(5000000000);
			const exp = BigNumber.from("10").pow(18);
			await expect(await mock.totalSupply()).to.equal(initial.mul(exp));
		});
	});

	describe("#balanceOf()", async function(){
		it("should return balanceOf callerAddr", async function(){
			const callerAddr = await caller.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy(); 
			const initial = BigNumber.from(5000000000);
			const exp = BigNumber.from("10").pow(18);
			await expect(await mock.balanceOf(callerAddr)).to.equal(initial.mul(exp));
		
			
		});
	});
});

describe("ERC20Burnable", function(){

	let mock : Contract;

	let caller : Signer;
	let sender : Signer;
	let recipient : Signer;
	let spender : Signer;
	let burner : Signer;
	let locked : Signer;
	let others : Signer[];
	let accounts : Signer[];

	beforeEach(async function(){
		accounts = await ethers.getSigners();
		[caller, sender, recipient, spender, locked, ...others] = accounts;
	});

	describe("#Burn event", async function(){
		it("should be emitted by Burn",async function(){
			const callerAddr = await caller.getAddress();
			const Factory = await ethers.getContractFactory("METACONCERT");
			mock = await Factory.deploy(); 
			await expect(mock.burn(100)).to.emit(mock,"Burn");;
		});
	});

	describe("#burn()",async function(){
		it("caller's balance should be burned", async function(){
			const callerAddr = await caller.getAddress();
			const Factory = await ethers.getContractFactory("METACONCERT");
			mock = await Factory.deploy(); 
			const preBal = await mock.balanceOf(callerAddr);
			await mock.burn(100);
			await expect(await mock.balanceOf(callerAddr)).to.not.equal(preBal);
		});
	});

	describe("#burnFrom()", async function(){
		it("recipient's balance should be burned", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy(); 
			await mock.transfer(recipientAddr, 100);
			await mock._approveTest(recipientAddr,callerAddr,100);
			await mock.burnFrom(recipientAddr,10);
			await expect(await mock.balanceOf(recipientAddr)).to.equal(90);
		});
	});
});

describe("ERC20Lockable", function(){

	let mock : Contract;

	let caller : Signer;
	let sender : Signer;
	let recipient : Signer;
	let spender : Signer;
	let burner : Signer;
	let locked : Signer;
	let others : Signer[];
	let accounts : Signer[];

	beforeEach(async function(){
		accounts = await ethers.getSigners();
		[caller, sender, recipient, spender, locked, ...others] = accounts;
	});

	describe("#Lock() event", async function(){
		it("should be emitted", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			await expect(mock._lockTest(callerAddr, 100, await mock.getTimeStamp()+100)).to.emit(mock,"Lock");
		});
	});

	describe("#Unlock() event", async function(){
		it("should be emitted", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			await mock._lockTest(callerAddr, 100, await mock.getTimeStamp()+100);
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(100);
			await expect(mock._unlockTest(callerAddr, 0)).to.emit(mock,"Unlock");
		});
	});

	describe("#checkLock() modifier", async function(){
		it("should be reverted by checkLockTest", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.transfer(recipientAddr, 100);
			await mock._lockTest(recipientAddr, 100, await mock.getTimeStamp()+100);
			await expect(mock.checkLockTest(recipientAddr, 100)).to.be.reverted;
		});

		it("should return 1", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.transfer(recipientAddr, 100);
			await mock._lockTest(recipientAddr, 10, await mock.getTimeStamp()+100);
			await expect(await mock.checkLockTest(recipientAddr,10)).to.equal(1);
		});
	});

	describe("#_lock()", async function(){
		it("should be reverted by due", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(mock._lockTest(callerAddr, 100,await mock.getTimeStamp())).to.be.reverted;
		});

		it("should be revereted by _balance[from] < amount + _totalLocked[from]", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(mock._lockTest(recipientAddr, 100, await mock.getTimeStamp()+100)).to.be.reverted;
			
		});

		it("should be locked", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			await mock._lockTest(callerAddr, 100, await mock.getTimeStamp()+100);
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(100);
		});
	});

	describe("#_unlock()", async function(){
		it("should be unlock after lock", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			await mock._lockTest(callerAddr, 100, await mock.getTimeStamp()+100);
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(100);
			await mock._unlockTest(callerAddr, 0);
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);

		});
	});
	
	describe("#unlock()", async function(){
		it("should be reverted by due", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			await mock._lockTest(callerAddr, 100, await mock.getTimeStamp()+100);
			await expect(mock.unlock(callerAddr,0)).to.be.reverted;
			
		});

		it("should be unlocked after lock", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			const due = await mock.setTimeStamp(100);
			await mock._lockTest(callerAddr, 100, due);
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(100);
			await ethers.provider.send("evm_increaseTime",[3600000])
			await ethers.provider.send("evm_mine", []);
			await mock.unlock(callerAddr, 0);
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
		});
	});

	describe("#unlockAll()", async function(){
		it("should not unlock by due > block.timestamp", async function(){
			//no 1->2
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			const due = await mock.setTimeStamp(1000000);
			await mock._lockTest(callerAddr, 100, due);
			await mock.unlockAll(callerAddr);
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(100);
			
		});

		it("should not unlock by _unlock(from,i-1), false", async function(){
			//1
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			const due = await mock.setTimeStamp(100);
			await mock._lockTest(callerAddr, 100, due);
			await ethers.provider.send("evm_increaseTime",[3600000])
			await ethers.provider.send("evm_mine", []);
			await mock.unlockAll(callerAddr);
			//_unlock(from,i-1) should never be false
			
		});

		it("should unlock locked address", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			const due = await mock.setTimeStamp(100);
			await mock._lockTest(callerAddr, 100, due);
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(100);
			await ethers.provider.send("evm_increaseTime",[3600000])
			await ethers.provider.send("evm_mine", []);
			await mock.unlockAll(callerAddr);
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
		});
	});

	describe("#releaseLock()", async function(){
		it("_unlock(from, i-1) should be false", async function(){

			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			const due = await mock.setTimeStamp(100);
			await mock.releaseLock(callerAddr);
			//_unlock(from,i-1) cannot be false
			
		});
		it("should unlock locked address", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			const due = await mock.setTimeStamp(100);
			await mock._lockTest(callerAddr, 100, due);
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(100);
			await ethers.provider.send("evm_increaseTime",[3600000])
			await ethers.provider.send("evm_mine", []);
			await mock.releaseLock(callerAddr);
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
		});
	});

	describe("#transferWithLockUp()", async function(){
		it("should be reverted by zero addr", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			const due = await mock.setTimeStamp(100);
			await expect(mock.transferWithLockUp(zero, 100,due)).to.be.reverted;	
	
		});
		it("should transfer 100 and lock recipient", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			const due = await mock.setTimeStamp(100);
			await mock.transferWithLockUp(recipientAddr, 100,due);
			await expect(await mock.balanceOf(recipientAddr)).to.equal(100);
			await expect(await mock.get_totalLocked(recipientAddr)).to.equal(100);
		});
	});

	describe("#lockInfo()", async function(){
		it("should return locked amount and due", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			const due = await mock.setTimeStamp(100);
			await mock._lockTest(callerAddr, 100, due);
			const lockinfo  = await mock.lockInfo(callerAddr,0);
			await expect(lockinfo[0]).to.equal(100);
			await expect(lockinfo[1]).to.equal(due);
		});
	});

	describe("#totalLocked()", async function(){
		it("should return locked amount and length", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.get_totalLocked(callerAddr)).to.equal(0);
			const due = await mock.setTimeStamp(100);
			await mock._lockTest(callerAddr, 100, due);
			const lockinfo  = await mock.totalLocked(callerAddr);
			await expect(lockinfo[0]).to.equal(100);
			await expect(lockinfo[1]).to.equal(1);
		});
	});
});

describe("ERC20Mintable", function(){

	let mock : Contract;

	let caller : Signer;
	let sender : Signer;
	let recipient : Signer;
	let spender : Signer;
	let burner : Signer;
	let locked : Signer;
	let others : Signer[];
	let accounts : Signer[];

	beforeEach(async function(){
		accounts = await ethers.getSigners();
		[caller, sender, recipient, spender, locked, ...others] = accounts;
	});

	describe("#Mint() event", async function(){
		it("should be emitted by Mint()", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(mock.mint(recipientAddr,100)).to.emit(mock,"Mint");
		});
	});

	describe("#MintFinished() event", async function(){
		it("should be emitted by MintFinished()", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.finishMint()).to.emit(mock,"MintFinished");
		});
	});


	describe("#mint()", async function(){
		it("should be reverted by zero", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(mock.mint(zero, 100)).to.be.reverted;
		});

		it("should be reverted by _mintingFinished", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.set_mintingFinished(true);
			await expect(mock.mint(recipientAddr,100)).to.be.reverted;
		});

		it("should mint 100 to recipient balance", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.mint(recipientAddr,100);
			await expect(await mock.balanceOf(recipientAddr)).to.equal(100);
		});
	});

	describe("#finishMint()", async function(){
		it("should be reverted by _mintingFinished", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.set_mintingFinished(true);
			await expect(mock.finishMint()).to.be.reverted;
		});

		it("should be emitted", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.finishMint()).to.emit(mock,"MintFinished");
		});
	});

	describe("#isFinished()", async function(){
		it("should return true", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.set_mintingFinished(true);
			await expect(await mock.isFinished()).to.equal(true);
		});

		it("should return false", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.set_mintingFinished(false);
			await expect(await mock.isFinished()).to.equal(false);
		});
	});
});

describe("Freezable", function(){
	let mock : Contract;

	let caller : Signer;
	let sender : Signer;
	let recipient : Signer;
	let spender : Signer;
	let burner : Signer;
	let locked : Signer;
	let others : Signer[];
	let accounts : Signer[];

	beforeEach(async function(){
		accounts = await ethers.getSigners();
		[caller, sender, recipient, spender, locked, ...others] = accounts;
	});

	describe("#Freeze() event", async function(){
		it("should be emitted by Freeze()", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(mock.freeze(recipientAddr)).to.emit(mock,"Freeze");
		});
	});

	describe("#Unfreeze() event", async function(){
		it("should be emitted by Unfreeze()", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.freeze(recipientAddr);
			await expect(mock.unFreeze(recipientAddr)).to.emit(mock,"Unfreeze");
		});
	});


	describe("#whenNotFrozen() modifier", async function(){
		it("should be reverted by _frozen[target]", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.freeze(recipientAddr);
			await expect(mock.whenNotFrozenTest(recipientAddr)).to.be.reverted;
		});
	});

	describe("#Freeze()", async function(){
		it("should return _frozen[target] is true", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.freeze(recipientAddr);
			await expect(await mock.isFrozen(recipientAddr)).to.equal(true);
		});
	});

	describe("#unFreeze()", async function(){
		it("should return _frozen[target] is false", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.freeze(recipientAddr);
			await expect(await mock.isFrozen(recipientAddr)).to.equal(true);
			await mock.unFreeze(recipientAddr);
			await expect(await mock.isFrozen(recipientAddr)).to.equal(false);
		});
	});

	describe("#isFrozen()", async function(){
		it("should return _frozen[target] is true", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.freeze(recipientAddr);
			await expect(await mock.isFrozen(recipientAddr)).to.equal(true);
		});
	});
});

describe("Ownable", function(){

	let mock : Contract;

	let caller : Signer;
	let sender : Signer;
	let recipient : Signer;
	let spender : Signer;
	let burner : Signer;
	let locked : Signer;
	let others : Signer[];
	let accounts : Signer[];

	beforeEach(async function(){
		accounts = await ethers.getSigners();
		[caller, sender, recipient, spender, locked, ...others] = accounts;
	});

	describe("#OwnershipTransferred event",async function(){
		it("should be emitted by OwnershipTransferred", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(mock.renounceOwnership()).to.emit(mock,"OwnershipTransferred");
		});
	});

	describe("#constructor()", async function(){
		it("_owner should be msg.sender", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.owner()).to.equal(callerAddr);
		});
	});

	describe("#onlyOwner() modifier", async function(){
		it("should be reverted by onlyOnwer",async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.transferOwnership(recipientAddr);
			await expect(mock.renounceOwnership()).to.be.reverted;
		});

		it("should be zero address", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.renounceOwnership();
			await expect(await mock.owner()).to.equal(zero);
		});
	});

	describe("#owner()", async function(){
		it("should return owner address", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(await mock.owner()).to.equal(callerAddr);
		});
	});

	describe("#transferOwnership()", async function(){
		it("should be reverted by zero", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(mock.transferOwnership(zero)).to.be.reverted;
		});

		it("should be transfered to recipient address", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.transferOwnership(recipientAddr);
			await expect(await mock.owner()).to.equal(recipientAddr);
		});
	});

	describe("#renouceOwnership()", async function(){
		it("should be zero address", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.renounceOwnership();
			await expect(await mock.owner()).to.equal(zero);
		});
	});

	describe("#_transferOwnership()",async function(){
		it("should be transferred to recipientAddr", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock._transferOwnershipTest(recipientAddr);
			await expect(await mock.owner()).to.equal(recipientAddr);
		});
	});

});

describe("Pausable", function(){
	let mock : Contract;

	let caller : Signer;
	let sender : Signer;
	let recipient : Signer;
	let spender : Signer;
	let burner : Signer;
	let locked : Signer;
	let others : Signer[];
	let accounts : Signer[];

	beforeEach(async function(){
		accounts = await ethers.getSigners();
		[caller, sender, recipient, spender, locked, ...others] = accounts;
	});


	describe("#Pause() event", async function(){
		it("should be emitted by Pause()", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(mock.pause()).to.emit(mock,"Paused");
		});
	});

	describe("#Unpause() event", async function(){
		it("should be emitted by Unpause()", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.pause();
			await expect(await mock.paused()).to.equal(true);
			await expect(mock.unPause()).to.emit(mock,"Unpaused");
			
		});
	});



	describe("#whenPaused() modifier", async function(){
		it("should be reverted by whenPaused()", async function(){

			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await expect(mock.unPause()).to.be.reverted;
		});
	});

	describe("#whenNotPaused() modifier", async function(){
		it("should be reverted by whenNotPaused()", async function(){

			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.pause()
			await expect(mock.pause()).to.be.reverted;
		});

	});

	describe("#pause()", async function(){
		it("should return _paused, true", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.pause();
			await expect(await mock.paused()).to.equal(true);
		});
	});

	describe("#unPause()",async function(){
		it("should return _paused, false", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.pause();
			await expect(await mock.paused()).to.equal(true);
			await mock.unPause();
			await expect(await mock.paused()).to.equal(false);
		});
	});

	describe("#pause()", async function(){
		it("should return _paused, true", async function(){
			const callerAddr = await caller.getAddress();
			const recipientAddr = await recipient.getAddress();
			const Factory = await ethers.getContractFactory("mockERC20");
			mock = await Factory.deploy();
			await mock.pause();
			await expect(await mock.paused()).to.equal(true);
		});
	});

});
	
