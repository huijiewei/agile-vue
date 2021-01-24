<template>
  <div v-show="options">
    <el-select :disabled="disabled" v-model="value" v-bind="$attrs">
      <el-option
        v-for="option in options"
        :key="option[optionValue]"
        :label="option[optionLabel]"
        :value="option[optionValue]"
      />
    </el-select>
    &nbsp;
    <el-button
      :disabled="disabled"
      size="mini"
      :title="refreshButtonTitle || '刷新选项数据'"
      icon="el-icon-refresh"
      @click="loadOptions"
    ></el-button>
  </div>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  name: 'RemoteSelect',
  props: {
    modelValue: {
      required: true,
    },
    disabled: Boolean,
    remoteMethod: {
      type: Function,
      required: true,
    },
    refreshButtonTitle: String,
    optionValue: {
      required: true,
    },
    optionLabel: {
      required: true,
    },
  },
  setup(props, { emit }) {
    const options = ref(null)

    const loadOptions = async () => {
      props.remoteMethod((data) => {
        options.value = data
      })
    }

    const value = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    loadOptions()

    return {
      value,
      options,
      loadOptions,
    }
  },
}
</script>

<style scoped></style>
