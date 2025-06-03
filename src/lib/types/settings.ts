export interface GeneralSettings {
    shopName: string;
    description?: string;
    logo?: string;
    favicon?: string;
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
    };
}

export interface AllSettings {
    general: GeneralSettings;
    customer: {
        allowRegistration: boolean;
        requireEmailVerification: boolean;
        defaultRole: string;
    };
    eshop: {
        enabled: boolean;
        orderStates: Array<{
            name: string;
            color: string;
        }>;
        currencies: Array<{
            code: string;
            symbol: string;
            name: string;
        }>;
    };
    doprava: {
        shippingMethods: Array<any>;
        minimumOrderValue: number;
        freeDeliveryThreshold: number;
    };
    products: {
        menuTitle: string;
        menuIntroText: string;
        visibleDays: number;
        features: Array<any>;
        showAllergens: boolean;
        showAllergensTooltip: boolean;
    };
    inventory: {
        trackInventory: boolean;
        lowStockThreshold: number;
    };
} 