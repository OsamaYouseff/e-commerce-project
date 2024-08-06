const Address = require('../models/Address'); // Adjust path as needed
const {
    verifyTokenAndAuthorization,
} = require("./verifyToken");

const router = require("express").Router();


//CREATE AN ADDRESS
router.post('/:id', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const newAddress = new Address({
            userId: req.user.id, // Assuming auth middleware attaches user to req
            fullAddress: req.body.fullAddress,
            phoneNumber: req.body.phoneNumber,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            label: req.body.label,
            isDefault: req.body.isDefault
        });

        const savedAddress = await newAddress.save();
        res.status(201).json(savedAddress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// GET AN ADDRESSES FOR A USER
router.get('/:id/:addressId', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const addresses = await Address.find({ _id: req.params.addressId });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// GET ALL ADDRESSES OF A USER
router.get('/:id', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user.id });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// UPDATE AN ADDRESS
router.put('/:id/:addressId', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const address = await Address.findOne({ _id: req.params.addressId, userId: req.user.id });
        if (!address) return res.status(404).json({ message: 'Address not found' });

        Object.assign(address, req.body);
        const updatedAddress = await address.save();
        res.json(updatedAddress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE AN ADDRESS
router.delete('/:id/:addressId', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({ _id: req.params.addressId, user: req.user.id });

        if (!address) return res.status(404).json({ message: 'Address not found' });

        const updatedAddresses = await Address.find({ userId: req.user.id });

        res.json({ message: 'Address deleted successfully', updatedAddresses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// SET DEFAULT ADDRESS




module.exports = router;