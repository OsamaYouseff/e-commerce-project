const Address = require('../models/Address'); // Adjust path as needed
const {
    verifyTokenAndAuthorization,
    verifyToken,
} = require("./verifyToken");

const router = require("express").Router();


// CREATE AN ADDRESS
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

        const addressCount = await Address.countDocuments({ userId: req.user.id });

        if (req.body.isDefault) {
            // Unset any existing default address
            await Address.updateMany(
                { userId: req.user.id, isDefault: true },
                { $set: { isDefault: false } }
            );
        }

        //// Set the new address as default if it's the only one
        if (!req.body.isDefault && addressCount === 0) {
            newAddress.isDefault = true;
        }

        const savedAddress = await newAddress.save();
        res.status(201).json(savedAddress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// GET AN ADDRESSES FOR A USER
router.get('/find/:id/:addressId', verifyTokenAndAuthorization, async (req, res) => {
    try {
        // console.log(req.params)
        const addresses = await Address.findOne({ _id: req.params.addressId });

        if (!addresses) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// GET ALL ADDRESSES OF A USER
router.get('/:id', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user.id })
            .sort({ isDefault: -1 }) // Sort by isDefault in descending order (true values first)
            .exec();

        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET DEFAULT ADDRESS FOR USER
router.get('/find-default/:id', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const defaultAddress = await Address.findOne(
            { userId: req.params.id, isDefault: true }
        ).exec();

        if (!defaultAddress) {
            return res.status(404).json({ message: 'No default address found' });
        }

        res.json(defaultAddress);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving default address', error: error.message });
    }
});


// UPDATE AN ADDRESS
router.put('/:id/:addressId', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const address = await Address.findOne({ _id: req.params.addressId, userId: req.user.id });
        if (!address) return res.status(404).json({ message: 'Address not found' });

        const addressCount = await Address.countDocuments({ userId: req.user.id });

        // Check if trying to unset the only address as default
        if (addressCount === 1 && !req.body.isDefault) {
            return res.status(400).json({ message: 'Cannot unset default for the only address' });
        }

        let updatedAddress;

        if (req.body.isDefault) {
            // Set this address as default and unset all others
            await Address.updateMany(
                { userId: req.user.id },
                { $set: { isDefault: false } }
            );
            Object.assign(address, req.body, { isDefault: true });
        } else if (address.isDefault && !req.body.isDefault) {
            // Unsetting the current default address
            Object.assign(address, req.body, { isDefault: false });
            // Set another address as default
            await Address.findOneAndUpdate(
                { userId: req.user.id, _id: { $ne: address._id } },
                { isDefault: true },
                { sort: { createdAt: -1 } }
            );
        } else {
            // Regular update without changing default status
            Object.assign(address, req.body);
        }

        updatedAddress = await address.save();
        res.json(updatedAddress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE AN ADDRESS
router.delete('/:id/:addressId', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({ _id: req.params.addressId, userId: req.user.id });

        if (!address) return res.status(404).json({ message: 'Address not found' });

        //// if deleted address was the default address, set another address as default
        if (address.isDefault) {
            await Address.findOneAndUpdate({ userId: req.user.id }, { isDefault: true }, { new: true });
        }

        const updatedAddresses = await Address.find({ userId: req.user.id }).sort({ isDefault: -1 })
            .exec();

        res.json({ message: 'Address deleted successfully', updatedAddresses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// SET DEFAULT ADDRESS
router.put('/set-default/:id/:addressId', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const addressId = req.params.addressId;
        const userId = req.user.id;

        // Find the address and check if it belongs to the user
        const address = await Address.findOne({ _id: addressId, userId: userId });
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const addressCount = await Address.countDocuments({ userId: userId });

        // Check if this address is already the default
        if (address.isDefault) {
            return res.status(400).json({ message: 'This address is already set as default' });
        }

        // If there's only one address, always set it as default
        if (addressCount === 1) {
            address.isDefault = true;
            await address.save();
            return res.json({ message: 'Address set as default', address });
        }

        // Unset any existing default address
        await Address.updateMany(
            { userId: userId, isDefault: true },
            { $set: { isDefault: false } }
        );

        // Set the new default address
        address.isDefault = true;
        await address.save();

        // Get all updated addresses
        const addresses = await Address.find({ userId: userId }).sort({ isDefault: -1 }).exec();

        res.json({ message: 'Default address updated successfully', addresses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});




module.exports = router;