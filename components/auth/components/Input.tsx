import { useFormik } from "formik";
import { Input as InputComponent } from "@heroui/input";

export default function Input({ formik, placeholder, name, type }: { formik: any, placeholder: string, name: string, type: string }) {
    return (
        <InputComponent
            type={type}
            label={placeholder}
            name={name}
            value={formik.values[name]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isInvalid={!!(formik.touched[name] && formik.errors[name])}
            errorMessage={formik.touched[name] && formik.errors[name] ? formik.errors[name] : undefined}
        />
    );
}