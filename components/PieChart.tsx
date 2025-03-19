import { Pie } from 'react-chartjs-2';
import { ChartData } from 'chart.js';

interface PieChartProps {
    data : ChartData<'pie'>;
}

const PieChart : React.FC<PieChartProps> = ({ data }) => {
    return <Pie data={data} />
}

export default PieChart;
