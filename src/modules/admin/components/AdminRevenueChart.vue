<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps({
  labels: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] },
  height: { type: Number, default: 280 },
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Doanh thu (VNĐ)',
      data: props.data,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.35,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const v = ctx.raw
          return v != null ? new Intl.NumberFormat('vi-VN').format(v) + 'đ' : ''
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => (value >= 1000000 ? value / 1000000 + 'M' : value / 1000 + 'K'),
      },
    },
  },
}
</script>

<template>
  <div :style="{ height: height + 'px' }">
    <Line :data="chartData" :options="options" />
  </div>
</template>
