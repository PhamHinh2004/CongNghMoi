exports.formatInventoryStatus = (products) => {
    return products.map(p => {
        let status = "Còn hàng";
        if (p.quantity === 0) status = "Hết hàng";
        else if (p.quantity < 5) status = "Sắp hết hàng";

        return { ...p, inventoryStatus: status };
    });
};