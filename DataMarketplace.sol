// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract DataMarketplace {
    struct DataListing {
        address seller;
        uint256 price;
        string availTxHash;
        string availBlockHash;
        string description;
        bool active;
    }
    
    // Mapping from listing ID to DataListing
    mapping(uint256 => DataListing) public listings;
    // Mapping from address to listing IDs they've purchased
    mapping(address => uint256[]) public purchases;
    // Counter for listing IDs
    uint256 private nextListingId = 1;
    
    // Events
    event DataListed(uint256 indexed listingId, address indexed seller, uint256 price, string description);
    event DataPurchased(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 price);
    event ListingUpdated(uint256 indexed listingId, uint256 newPrice, bool active);
    
    // List data for sale
    function listData(uint256 _price, string memory _availTxHash, string memory _availBlockHash, string memory _description) external returns (uint256) {
        require(bytes(_availTxHash).length > 0, "Transaction hash cannot be empty");
        require(bytes(_availBlockHash).length > 0, "Block hash cannot be empty");
        
        uint256 listingId = nextListingId++;
        
        listings[listingId] = DataListing({
            seller: msg.sender,
            price: _price,
            availTxHash: _availTxHash,
            availBlockHash: _availBlockHash,
            description: _description,
            active: true
        });
        
        emit DataListed(listingId, msg.sender, _price, _description);
        return listingId;
    }
    
    // Purchase data
    function purchaseData(uint256 _listingId) external payable {
        DataListing storage listing = listings[_listingId];
        
        require(listing.seller != address(0), "Listing does not exist");
        require(listing.active, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient payment");
        
        // Record the purchase
        purchases[msg.sender].push(_listingId);
        
        // Transfer payment to seller
        (bool success, ) = listing.seller.call{value: listing.price}("");
        require(success, "Payment transfer failed");
        
        // Refund excess payment if any
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - listing.price}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit DataPurchased(_listingId, msg.sender, listing.seller, listing.price);
    }
    
    // Check if an address has purchased a specific listing
    function hasPurchased(address _buyer, uint256 _listingId) public view returns (bool) {
        uint256[] memory userPurchases = purchases[_buyer];
        for (uint i = 0; i < userPurchases.length; i++) {
            if (userPurchases[i] == _listingId) {
                return true;
            }
        }
        return false;
    }
    
    // Get listing details
    function getListingDetails(uint256 _listingId) external view returns (
        address seller,
        uint256 price,
        string memory description,
        bool active
    ) {
        DataListing storage listing = listings[_listingId];
        require(listing.seller != address(0), "Listing does not exist");
        
        return (
            listing.seller,
            listing.price,
            listing.description,
            listing.active
        );
    }
    
    // Get data access details (only for buyers)
    function getDataAccessDetails(uint256 _listingId) external view returns (
        string memory availTxHash,
        string memory availBlockHash
    ) {
        require(hasPurchased(msg.sender, _listingId) || listings[_listingId].seller == msg.sender, "Not authorized");
        
        DataListing storage listing = listings[_listingId];
        require(listing.seller != address(0), "Listing does not exist");
        
        return (
            listing.availTxHash,
            listing.availBlockHash
        );
    }
    
    // Update listing price
    function updateListingPrice(uint256 _listingId, uint256 _newPrice) external {
        DataListing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Not the seller");
        
        listing.price = _newPrice;
        emit ListingUpdated(_listingId, _newPrice, listing.active);
    }
    
    // Activate/deactivate listing
    function setListingStatus(uint256 _listingId, bool _active) external {
        DataListing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Not the seller");
        
        listing.active = _active;
        emit ListingUpdated(_listingId, listing.price, _active);
    }
    
    // Get all purchases for a buyer
    function getPurchases() external view returns (uint256[] memory) {
        return purchases[msg.sender];
    }
}