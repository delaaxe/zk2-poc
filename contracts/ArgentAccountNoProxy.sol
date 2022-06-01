//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

contract ArgentAccountNoProxy {
    address public signer;

    modifier onlySigner() {
        require(
            msg.sender == signer || msg.sender == address(this),
            "argent/only-signer"
        );
        _;
    }

    constructor(address _signer) {
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
