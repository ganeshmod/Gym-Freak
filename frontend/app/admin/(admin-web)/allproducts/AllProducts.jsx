import React from 'react'
import StatCard from '../dashboard/components/statCard'
import ProductTable from '../dashboard/components/productTable'

export default function AllProducts() {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Sales"
                    percentageIncrease="+20.1%"
                    amount="$30,000"
                />
                <StatCard
                    title="Number of Sales"
                    percentageIncrease="+5.02%"
                    amount="982"
                />
                <StatCard title="Affliate" percentageIncrease="+20.1%" amount="$3453" />
                <StatCard
                    title="Discounts"
                    percentageIncrease="-2.1%"
                    amount="$5,340"
                />
            </div>
            {/* <div className="grid md:grid-cols-2 gap-6"> */}
            <ProductTable />
            {/* </div> */}
        </div>
    )
}
