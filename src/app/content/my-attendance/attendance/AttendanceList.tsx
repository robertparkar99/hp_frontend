import { format, parseISO, isValid } from 'date-fns';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  punchIn: string | null;
  punchOut: string | null;
  totalHours: number | null;
  status: 'present' | 'absent' | 'active';
}

interface AttendanceListProps {
  records: AttendanceRecord[];
}

export function AttendanceList({ records }: AttendanceListProps) {
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'EEE, MMM do');
    } catch {
      return dateStr;
    }
  };

  const formatHours = (decimalHours: number) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return '0h';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'active':
        return <Clock className="w-5 h-5 text-warning animate-pulse" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'active':
        return 'Active';
      case 'absent':
        return 'Absent';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      {records.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No attendance records found</p>
          <p className="text-sm">Your attendance will appear here once you start tracking</p>
        </div>
      ) : (
        records.map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 transition-colors duration-200"
          >
            <div className="flex items-center gap-4">
              {getStatusIcon(record.status)}
              <div>
                <p className="font-semibold text-foreground">
                  {formatDate(record.date)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getStatusText(record.status)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground mb-1">Punch In</p>
                <p className="font-semibold text-success">
                  {record.punchIn && isValid(new Date(record.punchIn))
                    ? format(new Date(record.punchIn), 'hh:mm a')
                    : '--'}
                </p>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground mb-1">Punch Out</p>
                <p className="font-semibold text-warning">
                  {record.punchOut && isValid(new Date(record.punchOut))
                    ? format(new Date(record.punchOut), 'hh:mm a')
                    : '--'}
                </p>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground mb-1">Total Hours</p>
                <p className="font-bold text-primary">
                  {record.totalHours ? formatHours(record.totalHours) : '--'}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
