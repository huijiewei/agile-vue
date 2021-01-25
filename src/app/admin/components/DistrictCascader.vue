<template>
  <el-cascader
    style="width: 100%"
    :placeholder="placeholder"
    :props="
      Object.assign(
        {
          value: 'id',
          label: 'name',
          checkStrictly: true,
          lazy: true,
          lazyLoad: loadDistricts,
          leaf: 'leaf',
        },
        props
      )
    "
    v-model="value"
  >
  </el-cascader>
</template>

<script>
import { computed } from 'vue'
import { useHttpClient } from '@shared/plugins/HttpClient'

export default {
  name: 'DistrictCascader',
  props: {
    modelValue: {},
    props: {},
    placeholder: {
      type: String,
      default: '选择地区',
    },
    leafLength: {
      type: Number,
      default: 9,
    },
    disabledCodes: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  setup(props, { emit }) {
    const httpClient = useHttpClient()

    const value = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    const loadDistricts = async (node, resolve) => {
      if (node.data && node.data.leaf) {
        resolve([])
        return
      }

      const parentId = node.data && node.data.id ? node.data.id : 0

      const { data } = await httpClient.get(
        'misc/districts',
        { parentId: parentId },
        false
      )

      if (data) {
        data.forEach((item) => {
          item.leaf = item.code.length === props.leafLength
          item.disabled = props.disabledCodes.includes(item.code)
        })

        const districts =
          parentId === 0
            ? [...[{ id: 0, name: '全国', code: '0', leaf: true }], ...data]
            : data

        resolve(districts)
      }
    }

    return {
      value,
      loadDistricts,
    }
  },
}
</script>
