import { useTranslation } from "react-i18next";
import { hobbies } from "./utils";

export const useHobbies = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });

  return hobbies.map((value) => ({
    value,
    label: t(`hobbies.${value}`),
  }));
};
