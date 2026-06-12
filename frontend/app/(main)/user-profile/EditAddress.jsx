"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { genericPostApi } from "@/app/admin/api-helper-admin";
import { useGlobalStore } from "@/globalStore";
import { useToast } from "@/app/components/customToastProvider";

const addressSchema = z.object({
    type: z.string().min(1, "Address type is required"),
    street: z.string().min(3, "Street is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    landMark: z.string().optional(),
    country: z.string().min(2, "Country is required"),
    postalCode: z.preprocess(
        (val) => (val ? Number(val) : undefined),
        z
            .number({
                required_error: "Postal code is required",
                invalid_type_error: "Postal code must be a number",
            })
            .int()
            .min(100000, "Postal code must be 6 digits")
            .max(999999, "Postal code must be 6 digits")
    ),
    isDefault: z.boolean().optional(),
});

export default function AddressDialog({
    open,
    onClose,
    addressData,
    userId,
    editingAddressId = null,
}) {
    const { success, error } = useToast()
    const { updateAddress } = useGlobalStore()
    const [defaultAdd, setDefaultAdd] = useState(false)

    const addressForm = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            type: addressData?.type || "Home",
            street: addressData?.street || "",
            city: addressData?.city || "",
            state: addressData?.state || "",
            postalCode: addressData?.postalCode || "",
            landMark: addressData?.landMark || "",
            country: addressData?.country || "",
            isDefault: addressData?.isDefault || false,
        },
    });

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            addressForm.reset({
                type: addressData?.type || "Home",
                street: addressData?.street || "",
                city: addressData?.city || "",
                state: addressData?.state || "",
                landMark: addressData?.landMark || "",
                country: addressData?.country || "",
                postalCode: addressData?.postalCode || "",
                isDefault: addressData?.isDefault || false,
            });
        }
    }, [open, addressData]);

    const handleAddressSubmit = addressForm.handleSubmit(async (values) => {
        const payload = {
            userId: userId,
            address: {
                ...(addressData?._id && { _id: addressData._id }),
                ...values
            },
            ...(defaultAdd && { defaultAddressId: addressData?._id })
        };
        const res = await genericPostApi("/api/user/updateUser", { ...payload });
        if (res.success) {
            updateAddress(res?.data?.addresses)
            success("Profile updated successfully!");
            onClose();
        } else {
            error(res.message);
        }
    });
    

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{editingAddressId ? "Edit Address" : "Add New Address"}</DialogTitle>
                    <DialogDescription>
                        {editingAddressId ? "Update your shipping address." : "Add a new shipping address to your account."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                    {/* Address Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type">Address Type</Label>
                        <Select
                            value={addressForm.watch("type")}
                            onValueChange={(value) => addressForm.setValue("type", value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Home">Home</SelectItem>
                                <SelectItem value="Work">Work</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {addressForm.formState.errors.type && (
                            <p className="text-sm text-red-500">
                                {addressForm.formState.errors.type.message}
                            </p>
                        )}
                    </div>

                    {/* Street */}
                    <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input id="street" {...addressForm.register("street")} placeholder="123 Main St" />
                        {addressForm.formState.errors.street && (
                            <p className="text-sm text-red-500">
                                {addressForm.formState.errors.street.message}
                            </p>
                        )}
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" {...addressForm.register("city")} placeholder="New York" />
                        {addressForm.formState.errors.city && (
                            <p className="text-sm text-red-500">
                                {addressForm.formState.errors.city.message}
                            </p>
                        )}
                    </div>

                    {/* State */}
                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" {...addressForm.register("state")} placeholder="NY" />
                        {addressForm.formState.errors.state && (
                            <p className="text-sm text-red-500">
                                {addressForm.formState.errors.state.message}
                            </p>
                        )}
                    </div>

                    {/* Landmark */}
                    <div className="space-y-2">
                        <Label htmlFor="landMark">Landmark</Label>
                        <Input id="landMark" {...addressForm.register("landMark")} placeholder="Near park or mall" />
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" {...addressForm.register("country")} placeholder="India" />
                        {addressForm.formState.errors.country && (
                            <p className="text-sm text-red-500">
                                {addressForm.formState.errors.country.message}
                            </p>
                        )}
                    </div>

                    {/* Postal Code */}
                    <div className="space-y-2">
                        <Label htmlFor="postalCode">ZIP Code</Label>
                        <Input id="postalCode" type="number" {...addressForm.register("postalCode")} placeholder="110001" />
                        {addressForm.formState.errors.postalCode && (
                            <p className="text-sm text-red-500">
                                {addressForm.formState.errors.postalCode.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="isDefault"
                        checked={addressForm.watch("isDefault")}
                        onCheckedChange={(checked) => {
                            addressForm.setValue("isDefault", checked)
                            console.log("Checed", checked)
                            setDefaultAdd(checked)
                        }}
                    />
                    <Label htmlFor="isDefault" className="cursor-pointer">
                        Set as default address
                    </Label>
                </div>


                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onClose();
                            addressForm.reset(); // clear form on cancel
                        }}
                    >
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleAddressSubmit}>
                        {editingAddressId ? "Update Address" : "Add Address"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
