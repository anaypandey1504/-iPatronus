'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPatient] = useState<Patient>({ id: 'pat1', name: 'John Doe' }); // Mock patient
  const [requestedDoctorId, setRequestedDoctorId] = useState<string | null>(null);

  useEffect(() => {
          throw new Error(data.message || 'Failed to fetch doctors');
        }

        setDoctors(data.doctors);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    }

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    socket.on('user-status-update', ({ userId, status }) => {
      setDoctors((prev) =>
        prev.map((doctor) =>
          doctor.id === userId ? { ...doctor, status } : doctor
        )
      );
    });

    return () => {
      socket.off('user-status-update');
    };
  }, [socket, user]);

  async function requestConnection(doctorId: string) {
    if (!user) return;

    try {
      setRequestedDoctorId(doctorId);

        if (!socket) {
          throw new Error('Socket connection not established');
        }

        socket.emit('connection-request', {
          doctorId,
          patientId: user.id,
          patientName: user.name,
        });

      // Wait for response
      const res = await fetch('/api/sessions/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId }),
      });

      const data = await res.json();

      if (data.session.status === 'ACCEPTED') {
        router.push(`/call/${data.session.roomId}`);
      } else {
        setRequestedDoctorId(null);
      }
    } catch (error) {
      console.error('Failed to request connection:', error);
      setRequestedDoctorId(null);
    }
  }

  if (!user) {
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
          <h1 className="text-2xl font-bold mb-2">Welcome, {user.name}</h1>
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