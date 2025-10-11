import { Bar } from 'react-chartjs-2';
import { ChartData } from 'chart.js';

interface BarChartProps {
    data : ChartData<'bar'>;
}

const BarChart : React.FC<BarChartProps> = ({ data }) => {
    return <Bar data={data} 
        options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
             }
        }}
    />
}

export default BarChart;