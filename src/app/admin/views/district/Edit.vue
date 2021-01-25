<template>
  <div class="box-header">
    <h4>{{ pageTitle }}</h4>
  </div>
  <el-row :gutter="0">
    <district-form
      v-if="district"
      :submit-text="pageTitle"
      :district="district"
      v-model:district-parents="districtParents"
      :is-edit="true"
      :can-submit="$can('district/edit')"
      @on-submit="editDistrict"
      @on-delete="deleteDistrict"
    >
    </district-form>
    <placeholder-form v-else />
  </el-row>
</template>

<script>
import DistrictForm from '@admin/views/district/_EditForm'
import PlaceholderForm from '@shared/components/Placeholder/PlaceholderForm'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { useDeleteDialog } from '@admin/hooks/useDeleteDialog'
import { ref, onBeforeMount } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'DistrictEdit',
  components: { PlaceholderForm, DistrictForm },
  emits: ['on-expanded', 'on-updated'],
  setup(props, { emit }) {
    const route = useRoute()
    const router = useRouter()
    const httpClient = useHttpClient()
    const { deleteDialog } = useDeleteDialog()

    const pageTitle = '编辑地区'

    const district = ref(null)
    const districtParents = ref([])

    const loadDistrict = async (id) => {
      const { data } = await httpClient.get('districts/' + id, {
        withParents: true,
      })

      if (data) {
        let parents = [0]

        if (
          data.parents &&
          Array.isArray(data.parents) &&
          data.parents.length > 0
        ) {
          parents = data.parents.map((parent) => parent.id)
        }

        districtParents.value = parents

        emit('on-expanded', parents, data.id)

        delete data.parents

        district.value = data
      }
    }

    const editDistrict = async (district, done, fail, always) => {
      const { data, error } = await httpClient.put(
        'districts/' + district.id,
        district
      )

      if (data) {
        done()

        ElMessage.success('修改成功')

        emit('on-updated', data.id, data.parentId, district.parentId)
      }

      if (error) {
        fail(error)
      }

      always()
    }

    const deleteDistrict = async (district) => {
      deleteDialog({
        message: `删除地区 <strong>${district.name}</strong>`,
        callback: async () => {
          const { data } = await httpClient.delete('districts/' + district.id)

          if (data) {
            ElMessage.success('删除成功')

            emit('on-updated', 0, district.parentId)

            await router.replace({
              path: '/district',
            })
          }
        },
      })
    }

    onBeforeMount(async () => {
      await loadDistrict(route.params.id)
    })

    onBeforeRouteUpdate(async (to, from, next) => {
      district.value = null
      next()
      await loadDistrict(to.params.id)
    })

    return {
      pageTitle,
      district,
      districtParents,
      editDistrict,
      deleteDistrict,
    }
  },
}
</script>
