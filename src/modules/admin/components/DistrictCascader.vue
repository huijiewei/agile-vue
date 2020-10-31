<template>
  <el-cascader
    style="width: 100%"
    :placeholder="placeholder"
    :options="rootDistricts"
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
    :value="value"
    @change="handleChange"
  >
  </el-cascader>
</template>

<script>
import MiscService from '@admin/services/MiscService'

export default {
  name: 'DistrictCascader',
  props: {
    value: {},
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
  model: {
    prop: 'value',
    event: 'change',
  },
  data() {
    return {
      rootDistricts: [],
    }
  },
  mounted() {
    this.getRootDistricts()
  },
  methods: {
    handleChange(value) {
      this.$emit('change', value)
    },
    async getDistricts(parentId) {
      return await MiscService.districts(parentId)
    },
    async getRootDistricts() {
      this.loading = true
      const { data } = await this.getDistricts(0)

      this.rootDistricts = [
        ...[
          {
            id: 0,
            name: '全国',
            code: '0',
            leaf: true,
          },
        ],
        ...data,
      ]

      this.loading = false
    },
    async loadDistricts(node, resolve) {
      if (node.data && node.data.id) {
        this.loading = true

        const { data } = await this.getDistricts(node.data.id)

        if (data) {
          data.forEach((item) => {
            item.leaf = item.code.length === this.leafLength
            item.disabled = this.disabledCodes.includes(item.code)
          })

          resolve(data)
        }

        this.loading = false
      }
    },
  },
}
</script>

<style scoped></style>
