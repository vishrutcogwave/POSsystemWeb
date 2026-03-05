export interface LoginRequest {
  username: string;
  password: string;
  branch_code:string
}

type ApiCategory = {
  catCode: number;
  catName: string;
  branchCode: string;
  subCategory: string;
  thumbnail: string | null;
};