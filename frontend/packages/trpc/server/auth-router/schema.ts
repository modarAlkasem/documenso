import {z} from "zod";


export const ZPasswordSchema = z.string().min(8,{message:"Must be at least 8 characters in length"}).max(72,{message:"Cannot be more than 72 characters in length"}).refine((value)=> value.length > 25 || /[A-Z]/.test(value),{
    message:"One uppercase is required"
}).refine((value)=> value.length > 25 || /[a-z]/.test(value),{message:"One lowercase character is required"} ).refine((value)=> value.length > 25 || /\d/.test(value),{
    message:"One number is required"
}).refine((value)=> value.length > 25 ||/[`~<>?,./!@#$%^&*()\-_"'+=|{}[\];:\\]/.test(value),{
    message:"One special character is required"
} )