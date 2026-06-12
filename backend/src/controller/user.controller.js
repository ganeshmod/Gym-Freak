import User from "../model/user.model.js";

const filterString = `-password -__v -role -verified -verificationToken -tokenExpiry`

export const fetchUser = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                data: null,
            });
        } else {
            const user = await User.findById(userId).select(filterString);
            if (user) {
                return res.status(200).json({
                    success: true,
                    message: "User Fetched Successfully",
                    data: user,
                });
            } else {
                throw new Error("User not Found")
            }
        }
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error,
            data: null,
        });
    }
}


export const updateUser = async (req, res) => {
    try {
        const { userId, name, lastName, role, phone, address, defaultAddressId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
                data: null,
            });
        }

        // --- Prepare top-level fields ---
        const updateFields = {
            ...(name && { name }),
            ...(lastName && { lastName }),
            ...(role && { role }),
            ...(phone && { phone }),
        };

        let updatedUser;

        if (address) {
            if (address._id) {
                // Update existing address by _id
                const addressUpdate = Object.fromEntries(
                    Object.entries(address)
                        .filter(([k]) => k !== "_id")
                        .map(([k, v]) => [`addresses.$.${k}`, v])
                );

                updatedUser = await User.findOneAndUpdate(
                    { _id: userId, "addresses._id": address._id },
                    { $set: { ...updateFields, ...addressUpdate } },
                    { new: true }
                ).select("addresses").exec();
            } else {
                // Append new address to addresses array
                updatedUser = await User.findByIdAndUpdate(
                    userId,
                    { $set: updateFields, $push: { addresses: address } },
                    { new: true }
                ).select("addresses").exec();
            }
        }

        // Handle default address setting
        if (defaultAddressId) {
            // First, set all addresses to not default
            await User.findByIdAndUpdate(
                userId,
                { $set: { "addresses.$[].isDefault": false } },
                { new: true }
            );

            // Then set the specified address as default
            updatedUser = await User.findOneAndUpdate(
                { _id: userId, "addresses._id": defaultAddressId },
                { $set: { "addresses.$.isDefault": true } },
                { new: true }
            );
        }

        // If no address operations, just update top-level fields
        if (!address && !defaultAddressId) {
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: updateFields },
                { new: true }
            );
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });

    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null,
        });
    }
};

export const removeAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.body
        if (!userId && !addressId) {
            return res.status(400).json({
                success: false,
                message: "Id is Missing",
                data: null,
            });
        } else {
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $pull: { addresses: { _id: addressId } } },
                { new: true }
            ).select("addresses").exec()

            return res.status(200).json({
                success: true,
                message: "Address Removed Succesfully",
                data: updatedUser,
            });
        }

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error,
            data: null,
        });
    }

}

