//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

contract ArgentAccount {
    address public signer;

    modifier onlySigner() {
        require(
            msg.sender == signer || msg.sender == address(this),
            "argent/only-signer"
        );
        _;
    }

    function initialize(address _signer) external {
        require(signer == address(0), "argent/already-init");
        signer = _signer;
    }

    function execute(address to, bytes calldata data) external onlySigner {
        _call(to, data);
    }

    function _call(address to, bytes memory data) internal {
        (bool success, bytes memory result) = to.call(data);
        if (!success) {
            // solhint-disable-next-line no-inline-assembly
            assembly {
                revert(result, add(result, 32))
            }
        }
    }
}
