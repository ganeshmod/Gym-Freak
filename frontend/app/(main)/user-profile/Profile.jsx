"use client";
import React, { use, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, Edit, Trash2, Check } from "lucide-react";
import EditProfileDialog from "./EditBasicInfo";
import AddressDialog from "./EditAddress";
import moment from "moment";
import { useGlobalStore } from "@/globalStore";
import DeleteModal from "@/app/components/deletePopup";
import { genericPostApi } from "@/app/admin/api-helper-admin";
import { useToast } from "@/app/components/customToastProvider";

const UserProfile = () => {
  const { success } = useToast();
  const userDetails = useGlobalStore((state) => state.userDetails);
  const [user, setUser] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [deletePopup, setDeletePopup] = useState(null);

  useEffect(() => {
    if (userDetails) {
      setUser(userDetails);
      setAddresses(userDetails?.addresses);
    }
  }, [userDetails]);

  async function handleDeleteAddress() {
    try {
      if (!deletePopup) throw new Error("Address Id not preset");
      const payload = {
        userId: userDetails._id,
        addressId: deletePopup,
      };
      const response = await genericPostApi("/api/user/removeAddress", {
        ...payload,
      });
      if (response.success) {
        setDeletePopup(null);
        success("Address Removed successfully!");
      }
      console.log("Response", response);
    } catch (error) {
      console.error("Getting error", error);
    }
  }

  async function handleDefaultAddress(id) {
    try {
      if (!id) throw new Error("Address Id not present");
      const payload = {
        userId: userDetails._id,
        defaultAddressId: id,
      };
      const response = await genericPostApi("/api/user/updateUser", payload);
      if (response.success) {
        setAddresses(response.data.addresses || response.data);
        success("Default address set successfully!");
      } else {
        error(response.message || "Failed to set default address");
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      error("Failed to set default address");
    }
  }

  const [purchaseHistory] = useState([
    {
      id: 1,
      productName: "Premium Protein Powder",
      price: 49.99,
      quantity: 2,
      total: 99.98,
      date: "2024-01-15",
      status: "Delivered",
    },
    {
      id: 2,
      productName: "Resistance Bands Set",
      price: 29.99,
      quantity: 1,
      total: 29.99,
      date: "2024-01-10",
      status: "Delivered",
    },
    {
      id: 3,
      productName: "Yoga Mat Pro",
      price: 39.99,
      quantity: 1,
      total: 39.99,
      date: "2024-01-05",
      status: "Processing",
    },
    {
      id: 4,
      productName: "Weightlifting Gloves",
      price: 24.99,
      quantity: 1,
      total: 24.99,
      date: "2024-01-02",
      status: "Delivered",
    },
  ]);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const openEditProfile = () => setIsProfileModalOpen(true);
  const openAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };
  const openEditAddress = (address) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const setDefaultAddress = (id) =>
    setAddresses((prev) =>
      prev.map((addr) => ({ ...addr, isDefault: addr.id === id }))
    );

  const getStatusVariant = (status) => {
    switch (status) {
      case "Delivered":
        return "default";
      case "Processing":
        return "secondary";
      case "Shipped":
        return "outline";
      default:
        return "default";
    }
  };

  const orderStages = [
    { label: "Ordered", status: "Ordered" },
    { label: "Processing", status: "Processing" },
    { label: "Shipped", status: "Shipped" },
    { label: "Delivered", status: "Delivered" },
  ];
  console.log("Address", editingAddress);

  return (
    <div className="app-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Card */}
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r app-black-text rounded-t-lg">
            <CardTitle className="text-3xl font-bold">My Profile</CardTitle>
            <CardDescription className="text-zinc-500">
              Manage your account information and track your orders
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Personal Information */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-slate-50 flex justify-between items-center">
            <CardTitle className="text-xl">Personal Information</CardTitle>
            <Button onClick={openEditProfile} className="gap-2">
              <Edit className="w-4 h-4" /> Edit Profile
            </Button>
          </CardHeader>

          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-600">Full Name</Label>
              <p className="text-lg font-medium">
                {user?.name} {user?.lastName}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Email</Label>
              <p className="text-lg font-medium">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Phone</Label>
              <p className="text-lg font-medium">{user.phone || "N/A"}</p>
            </div>
            {/* <div className='space-y-2'><Label className="text-gray-600">Memberszhip</Label><Badge className="text-sm px-3 py-1">{user.membership}</Badge></div> */}
            <div className="space-y-2">
              <Label className="text-gray-600">Member Since</Label>
              <p className="text-lg font-medium">
                {user.createdAt
                  ? moment(user.createdAt).format("Do MMM YYYY")
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Addresses */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-xl">Shipping Addresses</CardTitle>
            </div>
            <Button onClick={openAddAddress} className="gap-2">
              <MapPin className="w-4 h-4" /> Add Address
            </Button>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.length > 0 &&
              addresses.map((address, index) => (
                <Card
                  key={index}
                  className={`transition-all ${
                    address.isDefault
                      ? "border-2 border-blue-500 shadow-md"
                      : "hover:shadow-md"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {address?.type}{" "}
                      {address.isDefault && (
                        <Badge variant="default" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={"space-y-1"}>
                    <p className="text-sm font-medium">{address.street}</p>
                    {address?.landMark && (
                      <p className="text-sm text-gray-600">
                        Landmark: {address.landMark}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {" "}
                      {address?.city}, {address?.state} {address?.postalCode},{" "}
                      {address?.country}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditAddress(address)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDefaultAddress(address._id)}
                          className="flex-1"
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletePopup(address._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </CardContent>
        </Card>

        {/* Order Summary */}
        {/* <Card className="shadow-lg">
                    <CardHeader className="border-b bg-slate-50 flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" /><CardTitle className="text-xl">Order Summary</CardTitle></CardHeader>
                    <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg"><p className="text-sm text-gray-600 mb-1">Total Orders</p><p className="text-3xl font-bold text-blue-600">{purchaseHistory.length}</p></div>
                        <div className="text-center p-4 bg-green-50 rounded-lg"><p className="text-sm text-gray-600 mb-1">Total Spent</p><p className="text-3xl font-bold text-green-600">${purchaseHistory.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</p></div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg"><p className="text-sm text-gray-600 mb-1">Delivered</p><p className="text-3xl font-bold text-purple-600">{purchaseHistory.filter(order => order.status === 'Delivered').length}</p></div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg"><p className="text-sm text-gray-600 mb-1">Pending</p><p className="text-3xl font-bold text-orange-600">{purchaseHistory.filter(order => order.status !== 'Delivered').length}</p></div>
                    </CardContent>
                </Card> */}

        {/* Purchase History */}
        {/* <Card className="shadow-lg">
                    <CardHeader className="border-b bg-slate-50"><CardTitle className="text-xl">Purchase History</CardTitle></CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {purchaseHistory.map(order => {
                            const currentStageIndex = orderStages.findIndex(stage => stage.status === order.status);
                            return (
                                <Card key={order.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-lg">{order.productName}</h4>
                                                <p className="text-sm text-gray-500">Order Date: {order.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-blue-600">${order.total}</p>
                                                <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="relative pt-4 pb-2">
                                            <div className="flex items-center justify-between mb-2">
                                                {orderStages.map((stage, index) => (
                                                    <div key={stage.status} className="flex flex-col items-center relative" style={{ width: '25%' }}>
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 transition-all ${index <= currentStageIndex ? 'bg-green-500 border-green-500 text-white shadow-lg' : 'bg-gray-200 border-gray-300 text-gray-400'}`}>
                                                            {index < currentStageIndex ? <Check className="w-5 h-5" /> :
                                                                index === currentStageIndex ? <div className="w-4 h-4 bg-white rounded-full animate-pulse" /> :
                                                                    <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                                                        </div>
                                                        <p className={`text-xs mt-2 font-medium ${index <= currentStageIndex ? 'text-green-600' : 'text-gray-400'}`}>{stage.label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="absolute top-9 left-0 right-0 h-1 bg-gray-200 rounded" style={{ marginLeft: '12.5%', marginRight: '12.5%', width: '75%' }}>
                                                <div className="h-full bg-green-500 rounded transition-all duration-500" style={{ width: `${(currentStageIndex / 3) * 100}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                            <p className="text-sm text-gray-500">${order.price} each</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </CardContent>
                </Card> */}
      </div>

      <EditProfileDialog
        userDetails={userDetails}
        open={isProfileModalOpen}
        onClose={setIsProfileModalOpen}
      />
      <AddressDialog
        userId={userDetails?._id}
        addressData={editingAddress}
        open={isAddressModalOpen}
        onClose={setIsAddressModalOpen}
      />
      <DeleteModal
        itemName="Address"
        open={deletePopup ? true : false}
        onClose={() => setDeletePopup(null)}
        handleDelete={handleDeleteAddress}
      />
    </div>
  );
};

export default UserProfile;
