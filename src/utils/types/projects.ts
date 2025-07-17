export type UserRole = 'A' | 'E';
export type UserStatus = 'A' | 'I';
export type OfficeStatus = 'A' | 'I';

export interface Office {
    id_offi: number;
    name_offi: string;
    desc_offi: string;
    status_offi: OfficeStatus;
    created_at: string;
    updated_at: string;
}

export interface CreateOfficeRequest {
    name_offi: string;
    desc_offi: string;
}

export interface UserBase {
    id_user: number;
    name_user: string;
    ape_pat_user: string;
    ape_mat_user: string;
    dni_user: string;
    nick_user: string;
    level_user: UserRole;
    id_offi: string;
    status_user: UserStatus;
    created_at: string;
    updated_at: string;
}

export interface User extends UserBase {
    office: Office;
}

export interface CreateUserRequest {
    name_user: string;
    ape_pat_user: string;
    ape_mat_user: string;
    dni_user: string;
    nick_user: string;
    password: string;
    level_user: UserRole;
    id_offi: string;
}

export interface UpdateUserRequest {
    nick_user?: string;
    password?: string;
}

export interface LoginResponse {
    message: string;
    token_type: string;
    user: User;
    token: string;
}

export interface Document {
    id_doc: number;
    num_exp: string;
    id_user: number;
    creator: UserBase;
    updater: UserBase;
    id_offi: string;
    office: Office;
    pdf_path: string;
    status: string;
    status_doc: string;
}

export interface CreateDocumentRequest {
    num_exp: string;
    id_offi: string;
    pdf_file: File;
}

export interface Derivation {
    id: number;
    document_id: number;
    office_origin_id: string;
    office_destination_id: string;
    user_derives_id: number;
    derivation_date: string;
    observations: string;
    document_status_at_derivation: string;
    officeOrigin: Office;
    officeDestination: Office;
    userDeriver: UserBase;
}

export interface StatusHistory {
    id: number;
    document_id: number;
    previous_status: string;
    new_status: string;
    office_id: string;
    user_id: number;
    change_date: string;
    observations: string;
    office: Office;
    user: UserBase;
}