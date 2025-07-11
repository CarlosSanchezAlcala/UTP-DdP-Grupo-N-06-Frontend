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
    name_user?: string;
    ape_pat_user?: string;
    ape_mat_user?: string;
    dni_user?: string;
    nick_user?: string;
    password?: string;
    level_user?: UserRole;
    id_offi?: string;
    status_user?: UserStatus;
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
    id_offi: string;
    office: Office;
    pdf_path: string;
    status_env_doc: string;
    status_doc: string;
}

export interface CreateDocumentRequest {
    num_exp: string;
    id_offi: string;
    pdf_file: File;
}