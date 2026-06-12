export function getVariantDetails(variant) {
    const details = [];

    // Food & Consumable fields
    if (variant.flavour) details.push(`${variant.flavour}`);
    if (variant.servingSize) details.push(`${variant.servingSize}`);

    // Apparel / Fashion details
    if (variant.color) details.push(`${variant.color}`);
    if (variant.size) details.push(`Size: ${variant.size}`);
    if (variant.fit) details.push(`${variant.fit} Fit`);
    
    // Product Material/Build details
    if (variant.material) details.push(`${variant.material}`);
    if (variant.dimensions) details.push(`${variant.dimensions}`);

    // Common fields (only show weight if relevant)
    if (variant.weight) details.push(`${variant.weight}`);

    return details.join(", ") || "";
};