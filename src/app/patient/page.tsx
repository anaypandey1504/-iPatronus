'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { useSocket } from '@/lib/hooks/useSocket';

type DoctorStatus = 'AVAILABLE' | 'NOT_AVAILABLE' | 'BUSY';

interface Doctor {
  id: string;
  name: string;
  status: DoctorStatus;
}

interface Patient {
  id: string;
  name: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const socket = useSocket();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [patient] = useState<Patient>({ id: 'pat1', name: 'John Doe' });
  const [requestedDoctorId, setRequestedDoctorId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch('/api/doctors');
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch doctors');
        }
        setDoctors(data.doctors);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-room', patient.id);

    const handleStatusUpdate = ({
      userId,
      status,
    }: {
      userId: string;
      status: DoctorStatus;
    }) => {
      setDoctors((prev) => prev.map((d) => (d.id === userId ? { ...d, status } : d)));
    };

    const handleCallAccepted = ({
      patientId,
      roomName,
      roomUrl,
    }: {
      patientId: string;
      roomName: string;
      roomUrl?: string;
    }) => {
      if (patientId !== patient.id) return;

      setRequestedDoctorId(null);

      if (roomUrl) {
        router.push(`/call/${roomName}?url=${encodeURIComponent(roomUrl)}`);
      } else {
        router.push(`/call/${roomName}`);
      }
    };

    socket.on('USER_STATUS_UPDATE', handleStatusUpdate);
    socket.on('CALL_ACCEPTED', handleCallAccepted);

    return () => {
      socket.off('USER_STATUS_UPDATE', handleStatusUpdate);
      socket.off('CALL_ACCEPTED', handleCallAccepted);
    };
  }, [socket, patient.id, router]);

  async function requestConnection(doctorId: string) {
    if (!socket) return;

    try {
      setRequestedDoctorId(doctorId);
      socket.emit('REQUEST_CALL', {
        doctorId,
        patientId: patient.id,
        patientName: patient.name,
      });
    } catch (error) {
      console.error('Failed to request connection:', error);
      setRequestedDoctorId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold mb-2">Welcome, {patient.name}</h1>
          <p className="text-gray-600">
            Find an available doctor below to start a consultation
          </p>
        </div>

        <div className="grid gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold">Dr. {doctor.name}</h2>
                <p className="text-gray-600">Status: {doctor.status}</p>
              </div>
              <Button
                onClick={() => requestConnection(doctor.id)}
                disabled={
                  doctor.status !== 'AVAILABLE' || requestedDoctorId !== null
                }
                variant={doctor.status === 'AVAILABLE' ? 'primary' : 'secondary'}
              >
                {requestedDoctorId === doctor.id
                  ? 'Requesting...'
                  : doctor.status === 'AVAILABLE'
                  ? 'Request Consultation'
                  : 'Unavailable'}
              </Button>
            </div>
          ))}

          {doctors.length === 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg text-center text-gray-600">
              No doctors are currently registered in the system.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}