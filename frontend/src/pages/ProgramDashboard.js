// src/pages/ProgramDashboard.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController, // Import BarController
  LineController, // Import LineController
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController, // Register BarController
  LineController, // Register LineController
  Title,
  Tooltip,
  Legend,
  Filler
);

function ProgramDashboard() {
  const { programId } = useParams();
  const navigate = useNavigate();

  const [program, setProgram] = useState(null);
  const [summary, setSummary] = useState(null);

  const chartRef = useRef(null);

  // Formatter for currency
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  const fmt = (val) => currencyFormatter.format(val);

  useEffect(() => {
    // Fetch program details
    axios
      .get('http://localhost:8000/programs/')
      .then((response) => {
        const found = response.data.find((p) => p.id === parseInt(programId));
        setProgram(found || null);
      })
      .catch((error) => console.error('Error fetching program:', error));

    // Fetch financial summary
    axios
      .get(
        `http://localhost:8000/dashboard/summary/?program_id=${programId}&as_of_date=2025-02-25`
      )
      .then((response) => {
        setSummary(response.data);
      })
      .catch((error) => console.error('Error fetching summary:', error));

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [programId]);

  if (!program) return <div>Loading program details...</div>;
  if (!summary) return <div>Loading financial summary...</div>;

  // Sort month keys
  const monthKeys = Object.keys(summary.monthly_cash_flow || {}).sort();

  let runningBaseline = 0;
  let runningPlanned = 0;
  let runningActual = 0;

  const monthlyBaseline = [];
  const monthlyPlanned = [];
  const monthlyActual = [];

  const cumulativeBaseline = [];
  const cumulativePlanned = [];
  const cumulativeActual = [];

  monthKeys.forEach((monthKey) => {
    const { baseline = 0, planned = 0, actual = 0 } =
      summary.monthly_cash_flow[monthKey] || {};

    // Monthly
    monthlyBaseline.push(baseline);
    monthlyPlanned.push(planned);
    monthlyActual.push(actual);

    // Cumulative
    runningBaseline += baseline;
    runningPlanned += planned;
    runningActual += actual;

    cumulativeBaseline.push(runningBaseline);
    cumulativePlanned.push(runningPlanned);
    cumulativeActual.push(runningActual);
  });

  const mixedChartData = {
    labels: monthKeys,
    datasets: [
      // Bar datasets (monthly)
      {
        label: 'Monthly Baseline',
        type: 'bar',
        data: monthlyBaseline,
        backgroundColor: 'rgba(75, 75, 75, 0.5)',
        borderColor: '#4B4B4B',
        yAxisID: 'yBar',
        barPercentage: 0.8,
        categoryPercentage: 0.8
      },
      {
        label: 'Monthly Planned',
        type: 'bar',
        data: monthlyPlanned,
        backgroundColor: 'rgba(255,165,0,0.5)',
        borderColor: 'orange',
        yAxisID: 'yBar',
        barPercentage: 0.8,
        categoryPercentage: 0.8
      },
      {
        label: 'Monthly Actual',
        type: 'bar',
        data: monthlyActual,
        backgroundColor: 'rgba(0,128,0,0.5)',
        borderColor: 'green',
        yAxisID: 'yBar',
        barPercentage: 0.8,
        categoryPercentage: 0.8
      },
      // Line datasets (cumulative)
      {
        label: 'Cumulative Baseline',
        type: 'line',
        data: cumulativeBaseline,
        borderColor: '#4B4B4B',
        backgroundColor: 'rgba(75, 75, 75, 0.2)',
        fill: false,
        tension: 0.1,
        yAxisID: 'yLine'
      },
      {
        label: 'Cumulative Planned',
        type: 'line',
        data: cumulativePlanned,
        borderColor: 'orange',
        backgroundColor: 'rgba(255,165,0,0.2)',
        fill: false,
        tension: 0.1,
        yAxisID: 'yLine'
      },
      {
        label: 'Cumulative Actual',
        type: 'line',
        data: cumulativeActual,
        borderColor: 'green',
        backgroundColor: 'rgba(0,128,0,0.2)',
        fill: false,
        tension: 0.1,
        yAxisID: 'yLine'
      }
    ]
  };

  const mixedChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      x: {
        offset: true,
        title: { display: true, text: 'Month (YYYY-MM)' }
      },
      yBar: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Monthly Spend ($)' }
      },
      yLine: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'Cumulative Spend ($)' },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Program Dashboard: {program.program_name}</h1>

      {/* 
        Move Navigation Buttons to the TOP
      */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => navigate(`/ledger/${program.id}`)}
          style={{ marginRight: '1rem' }}
        >
          Open Ledger
        </button>
        <button onClick={() => navigate(`/wbs/${program.id}`)}>Open WBS Codes</button>
      </div>

      {/* 
        ---------------
        3 ROW LAYOUT with Grid
        ---------------
        Row 1 => 2 columns:
            1) Program Details
            2) Financial Summary
        Row 2 => single wide column spanning both columns: Chart
        Row 3 => 2 columns:
            1) Top Vendors
            2) Variance Alerts
      */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'auto auto auto',    // 3 main rows
          gridTemplateColumns: '1fr 1fr',        // 2 columns each row
          gridTemplateAreas: `
            "details summary"
            "chart   chart"
            "vendors alerts"
          `,
          gap: '1rem'
        }}
      >
        {/* ROW 1, COL 1 => Program Details */}
        <div
          style={{
            gridArea: 'details',
            padding: '1rem',
            border: '1px solid #ccc',
            background: '#fafafa'
          }}
        >
          <h2>Program Details</h2>
          <p>
            <strong>Code:</strong> {program.program_code}
          </p>
          <p>
            <strong>Description:</strong> {program.program_description}
          </p>
          <p>
            <strong>Manager:</strong> {program.program_manager}
          </p>
          <p>
            <strong>Status:</strong> {program.program_status}
          </p>
        </div>

        {/* ROW 1, COL 2 => Financial Summary */}
        <div
          style={{
            gridArea: 'summary',
            padding: '1rem',
            border: '1px solid #ccc',
            background: '#f9f9f9'
          }}
        >
          <h2>Financial Summary</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <th style={{ textAlign: 'left' }}>Actuals to Date:</th>
                <td style={{ textAlign: 'right', paddingLeft: '1rem' }}>
                  {fmt(summary.actuals_to_date)}
                </td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left' }}>Planned to Date:</th>
                <td style={{ textAlign: 'right', paddingLeft: '1rem' }}>
                  {fmt(summary.planned_to_date)}
                </td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left' }}>Estimate to Complete (ETC):</th>
                <td style={{ textAlign: 'right', paddingLeft: '1rem' }}>
                  {fmt(summary.etc)}
                </td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left' }}>Estimate at Completion (EAC):</th>
                <td style={{ textAlign: 'right', paddingLeft: '1rem' }}>
                  {fmt(summary.eac)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ROW 2 => Chart (spans 2 columns) */}
        <div
          style={{
            gridArea: 'chart',
            padding: '1rem',
            border: '1px solid #ccc'
          }}
        >
          <h2>Spending Trends</h2>
          <div 
            style={{ 
              width: '100%', 
              height: '600px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <Line ref={chartRef} data={mixedChartData} options={mixedChartOptions} />
          </div>
        </div>

        {/* ROW 3, COL 1 => Top Vendors */}
        <div
          style={{
            gridArea: 'vendors',
            padding: '1rem',
            border: '1px solid #ccc',
            background: '#e3f7d6'
          }}
        >
          <h2>Top Vendors</h2>
          {Array.isArray(summary.top_vendors) && summary.top_vendors.length > 0 ? (
            <ul>
              {summary.top_vendors.map((vendorObj) => (
                <li key={vendorObj.vendor}>
                  {vendorObj.vendor}: {fmt(vendorObj.spend)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No vendor data available.</p>
          )}
        </div>

        {/* ROW 3, COL 2 => Variance Alerts */}
        <div
          style={{
            gridArea: 'alerts',
            padding: '1rem',
            border: '1px solid #ccc',
            background: '#ffeeee'
          }}
        >
          <h2>Variance Alerts</h2>
          {summary?.variance_alerts && summary.variance_alerts.length > 0 ? (
            <ul>
              {summary.variance_alerts.map((alert) => (
                <li key={alert.wbs_category_id}>
                  WBS {alert.wbs_category_id}: Planned {fmt(alert.planned)} vs.
                  Actual {fmt(alert.actual)} (Variance: {fmt(alert.variance)})
                </li>
              ))}
            </ul>
          ) : (
            <p>No variance alerts.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgramDashboard;
