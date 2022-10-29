// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "base64-sol/base64.sol";

/// @title ??? To be documented
/// @notice ??? To be documented
contract CarapacePersist is ERC721Enumerable {
    using Strings for uint256;
    using Counters for Counters.Counter;

    struct persistParams {
        string url;
        string uploadDescription;
        string nftName;
        string nftDescription;
        string bigSqrHue;
        string smallSqrHue;
        string circleHue;
        string feetHue;
        string textHue;
    }

    mapping(uint256 => persistParams) private persistUploads;

    uint256 minUploadtPrice = 0; // public good
    // NFT can be burned so must have an independent counter
    Counters.Counter private _tokenIdTracker;

    constructor() ERC721("Carapace Persist", "PERSIST") {
    }

    // Prevents unauthorized access
     modifier onlyOwner(uint256 _uploadId) {
        _onlyOwner(_uploadId);
        _;
    }

    /// @notice Restricted to owner
    /// OO - Only Owner
    function _onlyOwner(uint256 _uploadId) private view {
        require(msg.sender == ownerOf(_uploadId), "OO");
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    /// ??? To be documented
    function getUploadsOfOwner(address _owner)  external view returns (uint256[] memory _uploadsOfOwner) {
        _uploadsOfOwner = new uint256[](ERC721.balanceOf(_owner));
        for (uint256 i=0;i<ERC721.balanceOf(_owner);i++){
            _uploadsOfOwner[i] = ERC721Enumerable.tokenOfOwnerByIndex(_owner, i);
        }
        return _uploadsOfOwner;
    }
    
    /// ??? To be documented
    function getUploadInfo(uint256 _uploadId) external view returns (
        string memory,
        string memory) {
        return (
            persistUploads[_uploadId].url,
            persistUploads[_uploadId].uploadDescription
        );
    }

    /// @notice Returns a random number between 0 and 360 to be used only as a color property (not critical)
    /// @dev used for hue color property (angle 0-360)
    /// @param _mod divisor
    /// @param _seed one random part of divident
    /// @param _salt one incremental part of divident
    /// @return num the divident of the modulos operation
    function randomNum(uint256 _mod, uint256 _seed, uint _salt) internal view returns(uint256 num) {
        num = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, _seed, _salt))) % _mod;
        return num;
    }
    
    /// @notice Returns a string that contains the image SVG code
    /// @dev Base64 encoded to be rendered on browser
    /// @param _tokenId Upload ID
    /// @return svg image string code in Base64 
    function buildImage(uint256 _tokenId) private view returns(string memory svg) {
        string memory svg1 = string(abi.encodePacked(
            '<svg width="790" height="806" viewBox="0 0 790 806" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="path-1-inside-1_715_82" fill="white"><rect x="154" y="724" width="164" height="82" rx="20"/></mask>',
            '<rect x="154" y="724" width="164" height="82" rx="20" fill="hsl(',persistUploads[_tokenId].feetHue,', 100%, 80%)" stroke="black" stroke-width="50" mask="url(#path-1-inside-1_715_82)"/>',
            '<mask id="path-2-inside-2_715_82" fill="white"><rect x="501" y="724" width="164" height="82" rx="20"/></mask>',
            '<rect x="501" y="724" width="164" height="82" rx="20" fill="hsl(',persistUploads[_tokenId].feetHue,', 100%, 80%)" stroke="black" stroke-width="50" mask="url(#path-2-inside-2_715_82)"/>',
            '<g filter="url(#filter0_d_715_82)"><rect x="36" width="750" height="750" rx="75" fill="url(#paint0_linear_715_82)" shape-rendering="crispEdges"/><rect x="53.5" y="17.5" width="715" height="715" rx="57.5" stroke="black" stroke-width="35" shape-rendering="crispEdges"/></g><rect x="153.5" y="117.5" width="515" height="515" rx="57.5" fill="url(#paint1_linear_715_82)" stroke="black" stroke-width="35"/><circle cx="411" cy="375" r="132.5" fill="url(#paint2_radial_715_82)" stroke="black" stroke-width="35"/><circle cx="411" cy="375" r="45" fill="black"/><line x1="410.5" y1="362.5" x2="410.5" y2="207.5" stroke="black" stroke-width="25" stroke-linecap="round"/><line x1="12.5" y1="263.5" x2="12.5" y2="118.5" stroke="black" stroke-width="25" stroke-linecap="round"/><line x1="12.5" y1="618.5" x2="12.5" y2="473.5" stroke="black" stroke-width="25" stroke-linecap="round"/><line x1="406.309" y1="387.075" x2="272.075" y2="464.575" stroke="black" stroke-width="25" stroke-linecap="round"/><line x1="549.809" y1="464.575" x2="415.575" y2="387.075" stroke="black" stroke-width="25" stroke-linecap="round"/><ellipse cx="184.5" cy="149.501" rx="87.4419" ry="87.442" transform="rotate(-89.962 184.5 149.501)" fill="#010101"/>',
            '<line x1="161.798" y1="167.902" x2="186.285" y2="210.316" stroke="hsl(',persistUploads[_tokenId].feetHue,', 100%, 60%)" stroke-width="4"/>'
        ));

        string memory svg2 = string(abi.encodePacked(
            '<line x1="209.128" y1="165.781" x2="184.64" y2="208.195" stroke="hsl(',persistUploads[_tokenId].feetHue,', 100%, 60%)" stroke-width="4"/>',
            '<line x1="138.995" y1="166.807" x2="229.889" y2="166.804" stroke="hsl(',persistUploads[_tokenId].feetHue,', 100%, 60%)" stroke-width="4"/>',
            '<path d="M161.243 166.943L137.853 126.429L161.243 85.916H208.024L231.415 126.429L208.024 166.943H161.243Z" stroke="hsl(',persistUploads[_tokenId].feetHue,', 100%, 60%)" stroke-width="4"/>',
            '<path d="M161.243 209.322L137.853 168.808L161.243 128.295H208.024L231.415 168.808L208.024 209.322H161.243Z" stroke="hsl(',persistUploads[_tokenId].feetHue,', 100%, 60%)" stroke-width="4"/>'
        ));

        string memory svg3 = string(abi.encodePacked(
            '<text text-anchor="middle" font-family="Courier New" font-size="30" x="50%" y="86%" fill="hsl(',persistUploads[_tokenId].textHue,', 100%, 60%)">CARAPACE PERSIST #',_tokenId.toString(),'</text>',
            '<defs><filter id="filter0_d_715_82" x="32" y="0" width="758" height="758" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_715_82"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_715_82" result="shape"/>',
            '</filter><linearGradient id="paint0_linear_715_82" x1="411" y1="0" x2="411" y2="750" gradientUnits="userSpaceOnUse">',
            '<stop stop-color="hsl(',persistUploads[_tokenId].bigSqrHue,', 100%, 80%)"/>',
            '<stop offset="1" stop-color="hsl(',persistUploads[_tokenId].bigSqrHue,', 100%, 80%)" stop-opacity="0.26"/>',
            '</linearGradient><linearGradient id="paint1_linear_715_82" x1="411" y1="100" x2="411" y2="650" gradientUnits="userSpaceOnUse">',
            '<stop offset="0.0654761" stop-color="hsl(',persistUploads[_tokenId].smallSqrHue,', 100%, 80%)" stop-opacity="0"/>'
        ));

        string memory svg4 = string(abi.encodePacked(
            '<stop offset="0.992559" stop-color="hsl(',persistUploads[_tokenId].smallSqrHue,', 100%, 80%)"/>',
            '</linearGradient><radialGradient id="paint2_radial_715_82" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(411 375) rotate(90) scale(150)">',
            '<stop offset="0.258184" stop-color="hsl(',persistUploads[_tokenId].circleHue,', 100%, 80%)" stop-opacity="0"/>',
            '<stop offset="0.950893" stop-color="hsl(',persistUploads[_tokenId].circleHue,', 100%, 80%)"/>',
            '</radialGradient></defs></svg>'
        ));

        svg = string(abi.encodePacked(svg1,svg2,svg3,svg4));
        
        return Base64.encode(bytes(svg));
    }
    
    /// @notice Returns a string that contains the standard metadata for a NFT
    /// @dev to override ERC721 tokenURI default function
    /// @param _tokenId Upload ID
    /// @return metadata string with standard information for a NFT
    function buildMetadata(uint256 _tokenId) internal view returns(string memory metadata) {
        return string(abi.encodePacked(
                'data:application/json;base64,', Base64.encode(bytes(abi.encodePacked(
                            '{"name":"', 
                            persistUploads[_tokenId].nftName,
                            '", "description":"', 
                            persistUploads[_tokenId].nftDescription,
                            '", "image": "', 
                            'data:image/svg+xml;base64,', 
                            buildImage(_tokenId),
                            '"}')))));
    }

    /// @notice Mint a new NFT and stores the correspondents params data
    /// @param _to The owner of upload
    /// @param _uploadId Upload ID
    function mintPersistUpload(address _to, uint256 _uploadId) private {
        persistParams memory newPersistParams = persistParams(
            "",
            "",
            string(abi.encodePacked('Persist #', uint256(_uploadId).toString())), 
            "Carapace persistent digital assets protection.",
            randomNum(361, gasleft(), _uploadId).toString(),
            randomNum(361, block.timestamp, _uploadId).toString(),
            randomNum(361, block.number, _uploadId).toString(),
            randomNum(361, block.gaslimit, _uploadId).toString(),
            randomNum(361, tx.gasprice, _uploadId).toString()
        );

        persistUploads[_uploadId] = newPersistParams;
        _safeMint(_to, _uploadId);
        _tokenIdTracker.increment();
    }

    /// @notice Returns the token URI for the NFT (vault) with standardized data
    /// @dev s ERC721 tokenURI default function
    /// @param _tokenId Vault ID
    /// @return _tokenURI String that contains the standard metadata for the token ID
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
      require(_exists(_tokenId),"NT");
      return buildMetadata(_tokenId);
    }

    /// @notice Transfers ETH to an address
    /// @param _to Address to send ETH
    /// @param _amount Value in ETH to be transferred
    /// @return transfered false if failed, or true if succeeded
    function transferETH(address _to, uint256 _amount) private returns (bool transfered) {
        (transfered, ) = payable(_to).call{value: _amount}("");
        require(transfered, "Failed to send Ether");
    }

    /// ??? To be documented
    function createUpload() external payable {
        require(msg.value >= minUploadtPrice, "MP");
        uint256 _uploadId = _tokenIdTracker.current();

        // mint NFT
        mintPersistUpload(msg.sender, _uploadId);
    }

    /// ??? To be documented
    function updateUpload(
        uint256 _uploadId,        
        string memory _url,
        string memory _uploadDescription
    ) external onlyOwner(_uploadId) {
        persistUploads[_uploadId].url = _url;
        persistUploads[_uploadId].uploadDescription = _uploadDescription;
    }

    /// ??? To be documented
    /// it is not possible to delete files from Arweave
    /// burning NFT (the key) it is impossible to decipher the file data
    /// 
    function deleteFile(
        uint256 _uploadId
    ) external onlyOwner(_uploadId) {
        // burn NFT
        _burn(_uploadId);
    }
}