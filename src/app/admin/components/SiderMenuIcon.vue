<template>
  <ag-icon :path="icon" />
</template>

<script>
import AgIcon from '../../../shared/components/Icon/index'
export default {
  name: 'SiderMenuIcon',
  components: { AgIcon },
  props: {
    icon: {
      type: String,
      default: '',
    },
  },
}
</script>
