"use client";
import { useEffect } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { genericPostApi } from "@/app/admin/api-helper-admin";
import { useGlobalStore } from "@/globalStore";
import { useToast } from "@/app/components/customToastProvider";

const editProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || val.length >= 10, {
            message: "Phone must be at least 10 digits",
        }),
});

export default function EditProfileDialog({ userDetails, open, onClose, onUpdated }) {
    const { success, error } = useToast()
    const setUserDetails = useGlobalStore((state) => state.setUserDetails);
    const userForm = useForm({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            name: userDetails?.name || "",
            lastName: userDetails?.lastName || "",
            phone: userDetails?.phone || "",
        },
    });

    const handleUserSubmit = userForm.handleSubmit(async (values) => {
        const res = await genericPostApi("/api/user/updateUser", { userId: userDetails._id, ...values });
        if (res.success) {
            setUserDetails(res.data);
            success("Profile updated successfully!");
            onClose();
        } else {
            error(res.message);
        }
    });

    useEffect(() => {
        if (open) {
            userForm.reset({
                name: userDetails?.name || "",
                lastName: userDetails?.lastName || "",
                phone: userDetails?.phone || "",
            });
        }
    }, [open, userDetails]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Update your personal information here.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">First Name</Label>
                        <Input id="name" {...userForm.register("name")} />
                        {userForm.formState.errors.name && (
                            <p className="text-sm text-red-500">{userForm.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" {...userForm.register("lastName")} />
                        {userForm.formState.errors.lastName && (
                            <p className="text-sm text-red-500">{userForm.formState.errors.lastName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={userDetails?.email || ""} disabled className="bg-gray-100" />
                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" {...userForm.register("phone")} />
                        {userForm.formState.errors.phone && (
                            <p className="text-sm text-red-500">{userForm.formState.errors.phone.message}</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onClose()}>Cancel</Button>
                    <Button type="button" onClick={handleUserSubmit} disabled={userForm.formState.isSubmitting}>
                        {userForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
