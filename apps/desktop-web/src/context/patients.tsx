import { ListPatientDto } from '@contact-patient/dtos';
import axios from 'axios';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type PatientsContextProps = {
  contactedPatients: ListPatientDto[];
  notContactedPatients: ListPatientDto[];
};

const PatientsContext = createContext<PatientsContextProps>({
  contactedPatients: [],
  notContactedPatients: [],
});

export const PatientsProvider = ({ children }: { children: ReactNode }) => {
  const [contactedPatients, setContactedPatients] = useState<ListPatientDto[]>(
    []
  );
  const [notContactedPatients, setNotContactedPatients] = useState<
    ListPatientDto[]
  >([]);

  const fetchPatients = () => {
    axios
      .get('http://localhost:3333/patients', { params: { contacted: true } })
      .then((response) => {
        if (response?.data) {
          setContactedPatients(response.data);
        }
      });

    axios
      .get('http://localhost:3333/patients', { params: { contacted: false } })
      .then((response) => {
        if (response?.data) {
          setNotContactedPatients(response.data);
        }
      });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <PatientsContext.Provider
      value={{ contactedPatients, notContactedPatients }}
    >
      {children}
    </PatientsContext.Provider>
  );
};

export const usePatients = () => {
  return useContext(PatientsContext);
};
