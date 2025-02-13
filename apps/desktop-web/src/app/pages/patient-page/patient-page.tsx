import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { DetailedPatientDto } from '@contact-patient/dtos';
import { Button, Descriptions, Skeleton } from 'antd';
import axios from 'axios';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { usePatients } from '../../../context/patients';
import { PatientOverviewUrl, PatientUrl } from '../urls';

export type PatientPageProps = RouteComponentProps<{ patientId: string }>;

export function PatientPage(props: PatientPageProps) {
  // Get the history object for navigation
  const history = useHistory();

  // Get the patient ID from the URL
  const patientId = props?.match?.params?.patientId;

  // Detailed patient state
  const [patient, setPatient] = useState<DetailedPatientDto>();

  // State for loading detailed patient
  const [loadingPatient, setLoadingPatient] = useState(false);

  // Get all patients from the context
  const { contactedPatients, notContactedPatients, fetchPatients } =
    usePatients();
  const patients = patient?.contacted
    ? contactedPatients
    : notContactedPatients;

  // Get the index of the current patient and the total number of patients
  const currentPatientIndex = patients.findIndex((p) => p.id === patient?.id);
  const totalPatients = patients.length;

  /**
   * Fetch patient details when ID changes.
   */
  useEffect(() => {
    if (!patientId) {
      return;
    }

    setLoadingPatient(true);

    axios
      .get(`http://localhost:3333/patients/${patientId}`)
      .then((response) => {
        if (response?.data) {
          setPatient(response.data);
        }
        setLoadingPatient(false);
      });
  }, [patientId]);

  /**
   * Function for marking a patient as contacted or not contacted.
   * @param newContactedValue
   */
  const markContacted = (newContactedValue: boolean) => {
    // create a new patient object with the new contacted value
    const updatedPatient = {
      ...patient,
      contacted: newContactedValue,
    };

    // Send PATCH request to update patient
    axios
      .patch(`http://localhost:3333/patients/${patientId}`, updatedPatient)
      .then((response) => {
        if (response?.data) {
          // if the patient was the only patient, go to patient overview
          if (totalPatients === 1) {
            goToPatientOverview();
            return;
          }
          // if the patient was not the last patient
          if (currentPatientIndex !== totalPatients - 1) {
            // re-fetch patients for new totalpatients
            fetchPatients();
            // then go to the next patient
            goToNextPatient();
            return;
          }
          // if patient was the last patient
          // re-fetch patients for new totalpatients
          fetchPatients();
          // go to the previous patient
          goToPreviousPatient();
          return;
        }
      });
  };

  /**
   * Function for going to patient overview.
   */
  const goToPatientOverview = () => {
    history.push(PatientOverviewUrl);
  };

  /**
   * Function for going to the previous patient.
   */
  const goToPreviousPatient = () => {
    // If the current patient is the first patient, return
    if (currentPatientIndex === 0) {
      return;
    }
    // Get the previous patient fro patients
    const previousPatientIndex = currentPatientIndex - 1;
    const previousPatient = patients[previousPatientIndex];
    // Navigate to the previous patient
    history.push(PatientUrl.replace(':patientId', previousPatient.id));
  };

  /**
   * Function for going to the next patient.
   */
  const goToNextPatient = () => {
    // If the current patient is the last patient, return
    if (currentPatientIndex === totalPatients - 1) {
      return;
    }
    // Get the next patient from patients
    const nextPatientIndex = currentPatientIndex + 1;
    const nextPatient = patients[nextPatientIndex];
    // Navigate to the next patient
    history.push(PatientUrl.replace(':patientId', nextPatient.id));
  };

  // If loading patient, show loading animation
  if (loadingPatient) {
    return <Skeleton />;
  }

  // If no patient found for id, show error message
  if (!patient) {
    return <p>No patient found for id: "{patientId}"</p>;
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '50px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Button icon={<LeftOutlined />} onClick={goToPatientOverview} />
          <h1>
            ({currentPatientIndex + 1} / {totalPatients}) Patient: {patient.ssn}
          </h1>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Button
            type="primary"
            onClick={() => goToPreviousPatient()}
            icon={<LeftOutlined />}
            // TODO - maybe update the disabled state?
            disabled={currentPatientIndex === 0}
          />
          <Button
            type="primary"
            onClick={() => markContacted(!patient.contacted)}
          >
            {patient.contacted ? 'Mark not contacted' : 'Mark contacted'}
          </Button>
          <Button
            type="primary"
            onClick={() => goToNextPatient()}
            icon={<RightOutlined />}
            // TODO - maybe update the disabled state?
            disabled={currentPatientIndex === totalPatients - 1}
          />
        </div>
      </div>

      <Descriptions>
        <Descriptions.Item label="First name">
          {patient.firstName}
        </Descriptions.Item>
        <Descriptions.Item label="Last name">
          {patient.lastName}
        </Descriptions.Item>
        <Descriptions.Item label="Contacted">
          {patient.contacted ? 'Yes' : 'No'}
        </Descriptions.Item>
        <Descriptions.Item label="Gender">
          {patient.gender?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Patient created">
          {format(new Date(patient.created), 'dd-MM-yyyy')}
        </Descriptions.Item>
        <Descriptions.Item label="Patient updated">
          {format(new Date(patient.updated), 'dd-MM-yyyy')}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}
