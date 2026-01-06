export declare enum PayDunyaPaymentMethod {
    WAVE = "WAVE_SN",
    ORANGE_MONEY = "ORANGE_MONEY_SN"
}
export declare class CreatePaymentDto {
    orderId: number;
    phoneNumber: string;
    fullName?: string;
    email?: string;
    otpCode?: string;
}
