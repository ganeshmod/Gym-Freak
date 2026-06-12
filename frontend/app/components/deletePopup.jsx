"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const DeleteModal = ({ open = false, onClose, handleDelete, itemName }) => {

    return (
        <Dialog open={open} onOpenChange={onClose} >
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Delete {itemName || "Item"}?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this {itemName || "item"}? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteModal;
