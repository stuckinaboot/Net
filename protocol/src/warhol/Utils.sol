// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 .0;

import { LibString } from "../utils/LibString.sol";

library Utils {
    using LibString for uint256;
    using LibString for uint16;
    using LibString for uint8;

    string internal constant _BASE64_TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function willieTrait(
        uint16 willieTokenId,
        uint8 willieNumber,
        bool trailingComma
    )
        internal
        pure
        returns (string memory)
    {
        return getTrait(
            string.concat("Composed Willie ", willieNumber.toString()), willieTokenId.toString(), trailingComma
        );
    }

    function getDecimalStringFrom1e18ScaledUint256(uint256 scaled) internal pure returns (string memory decimal) {
        uint256 partBeforeDecimal = scaled / 1e18;
        uint256 partAfterDecimal = (scaled % 1e18);
        if (partAfterDecimal > 1e17) {
            // Throw out last 12 digits, as that much precision is unnecessary and bloats the string size
            partAfterDecimal = partAfterDecimal / 1e12;
        }
        return string.concat(partBeforeDecimal.toString(), ".", partAfterDecimal.toString());
    }

    function formatTokenURI(
        uint256 _tokenId,
        string memory _imageURI,
        string memory _animationURI,
        string memory _properties
    )
        internal
        pure
        returns (string memory)
    {
        return string.concat(
            "data:application/json;base64,",
            encodeBase64(
                bytes(
                    string.concat(
                        '{"name":"Pop Willie #',
                        _tokenId.toString(),
                        '","description":"Pop Willies are onchain generative pop art blending a hand-drawn classic with blockchain-enabled composable digital art.","attributes":',
                        _properties,
                        ',"image":"',
                        _imageURI,
                        '","animation_url":"',
                        _animationURI,
                        '"}'
                    )
                )
            )
        );
    }

    function getTrait(
        string memory traitType,
        string memory value,
        bool includeTrailingComma
    )
        internal
        pure
        returns (string memory)
    {
        return string.concat('{"trait_type":"', traitType, '","value":"', value, '"}', includeTrailingComma ? "," : "");
    }

    // Encode some bytes in base64
    // https://gist.github.com/mbvissers/8ba9ac1eca9ed0ef6973bd49b3c999ba
    function encodeBase64(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        // load the table into memory
        string memory table = _BASE64_TABLE;

        unchecked {
            // multiply by 4/3 rounded up
            uint256 encodedLen = 4 * ((data.length + 2) / 3);

            // add some extra buffer at the end required for the writing
            string memory result = new string(encodedLen + 32);

            assembly {
                // set the actual output length
                mstore(result, encodedLen)

                // prepare the lookup table
                let tablePtr := add(table, 1)

                // input ptr
                let dataPtr := data
                let endPtr := add(dataPtr, mload(data))

                // result ptr, jump over length
                let resultPtr := add(result, 32)

                // run over the input, 3 bytes at a time
                for { } lt(dataPtr, endPtr) { } {
                    dataPtr := add(dataPtr, 3)

                    // read 3 bytes
                    let input := mload(dataPtr)

                    // write 4 characters
                    mstore(resultPtr, shl(248, mload(add(tablePtr, and(shr(18, input), 0x3F)))))
                    resultPtr := add(resultPtr, 1)
                    mstore(resultPtr, shl(248, mload(add(tablePtr, and(shr(12, input), 0x3F)))))
                    resultPtr := add(resultPtr, 1)
                    mstore(resultPtr, shl(248, mload(add(tablePtr, and(shr(6, input), 0x3F)))))
                    resultPtr := add(resultPtr, 1)
                    mstore(resultPtr, shl(248, mload(add(tablePtr, and(input, 0x3F)))))
                    resultPtr := add(resultPtr, 1)
                }

                // padding with '='
                switch mod(mload(data), 3)
                case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
                case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
            }

            return result;
        }
    }
}
