import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const RevenueChart: React.FC = () => {
  const series = [
    {
      name: 'Revenue',
      data: [3200, 4100, 2800, 5100, 4200, 3800, 4900]
    }
  ];
  
  const options: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#8A2BE2'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      labels: {
        style: {
          colors: '#64748b',
          fontFamily: 'Poppins, sans-serif'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        formatter: function(val) {
          return '₹' + val.toFixed(0);
        },
        style: {
          colors: '#64748b',
          fontFamily: 'Poppins, sans-serif'
        }
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return '₹' + val.toFixed(0);
        }
      },
      theme: 'light'
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        left: 20,
        right: 20
      }
    },
    markers: {
      size: 5,
      colors: ['#8A2BE2'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 7
      }
    }
  };

  return (
    <ReactApexChart 
      options={options} 
      series={series} 
      type="area" 
      height="100%" 
    />
  );
};

export default RevenueChart;