export const CHART_CONFIG = {
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1e293b',
      bodyColor: '#1e293b',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 10,
      displayColors: false,
      callbacks: {
        label: (context: any) => `$${context.parsed.y.toFixed(2)}`
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#64748b',
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8
      }
    },
    y: {
      position: 'right',
      grid: {
        color: '#e2e8f0'
      },
      ticks: {
        color: '#64748b',
        callback: (value: number) => `$${value.toFixed(2)}`,
        maxTicksLimit: 6
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  },
  elements: {
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4
    }
  },
  animation: {
    duration: 0
  }
};
