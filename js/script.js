
    const stakingAddress = "0xe2504F77106B1dCe24a8aC97E06eBFeE564A7459";
    const stakingABI = [{"inputs":[{"internalType":"address","name":"_token","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Claimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PoolDrained","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Unstaked","type":"event"},{"inputs":[],"name":"baseAPR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"drainPool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getDynamicAPR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getStake","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minAPR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"pendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"stakes","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"}];
    const tokenAddress = "0x597eeaf9ee81411734e64eb5053339d145f7c0f1";

    let provider, signer, contract, tokenContract, userAddress, isConnected = false;

    async function connectWallet() {
  if (!window.ethereum) return alert("Please install MetaMask.");
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  userAddress = await signer.getAddress();
  contract = new ethers.Contract(stakingAddress, stakingABI, signer);
  tokenContract = new ethers.Contract(tokenAddress, [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
  ], signer);
  isConnected = true;

  const btn = document.getElementById("connectWallet");
  btn.innerText = `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
  btn.disabled = true;
  btn.style.opacity = 0.6;
  btn.style.cursor = "default";

  fetchTokenBalance();
  fetchStakeData();

  // Detect network
  const { chainId } = await provider.getNetwork();
  let networkName = "";
  if (chainId === 56n) {
    networkName = "BSC Mainnet";
  } else if (chainId === 97n) {
    networkName = "BSC Testnet";
  } else {
    networkName = `Unsupported network (Chain ID: ${chainId})`;
    alert("Unsupported network. Please switch to BSC Mainnet or Testnet.");
  }

  // Update network status above the Connect Wallet button
  const networkStatusDiv = document.getElementById("networkStatus");
  networkStatusDiv.innerText = `Network: ${networkName}`;
  networkStatusDiv.style.display = "block"; // Ensure network status is shown
}


  async function fetchTokenBalance() {
    if (!isConnected) return;
    try {
      const balance = await tokenContract.balanceOf(userAddress);
      document.getElementById("tokenBalance").innerText = ethers.formatEther(balance);
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  }

  async function fetchStakeData() {
    if (!isConnected) return;
    try {
      const [staked, rewards] = await contract.getStake(userAddress);
      document.getElementById("stakedAmount").innerText = ethers.formatEther(staked);
      document.getElementById("rewardAmount").innerText = ethers.formatEther(rewards);
    } catch (error) {
      console.error("Error fetching stake data:", error);
    }
  }

  async function stakeTokens() {
    if (!isConnected) return alert("Connect wallet first.");
    const input = document.getElementById("stakeInput").value;
    if (!input || isNaN(input)) return alert("Enter a valid amount.");

    const amount = ethers.parseEther(input);

    try {
      const approveTx = await tokenContract.approve(stakingAddress, amount);
      await approveTx.wait();

      const tx = await contract.stake(amount);
      await tx.wait();

      fetchTokenBalance();
      fetchStakeData();
      alert("Staking successful!");
    } catch (error) {
      console.error("Error staking tokens:", error);
      alert("Staking failed. Check console.");
    }
  }

  async function unstakeTokens() {
    if (!isConnected) return alert("Connect wallet first.");
    try {
      const tx = await contract.unstake();
      await tx.wait();
      fetchTokenBalance();
      fetchStakeData();
      alert("Unstake successful!");
    } catch (error) {
      console.error("Error unstaking tokens:", error);
      alert("Unstaking failed.");
    }
  }

  async function claimRewards() {
    if (!isConnected) return alert("Connect wallet first.");
    try {
      const tx = await contract.claim();
      await tx.wait();
      fetchStakeData();
      alert("Rewards claimed!");
    } catch (error) {
      console.error("Error claiming rewards:", error);
      alert("Claim failed.");
    }
  }
 