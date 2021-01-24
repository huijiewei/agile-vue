<template>
  <el-form
    ref="formRef"
    :model="form"
    label-width="100px"
    label-suffix="："
    @submit.stop.prevent="handleSubmit(onSubmit)"
  >
    <el-form-item
      label="名称"
      prop="name"
      :error="errors.name"
      :rules="[
        { required: true, message: '请输入管理组名称', trigger: 'blur' },
        {
          min: 3,
          max: 10,
          message: '管理组名称长度在 3 到 10 个字符',
          trigger: 'blur',
        },
      ]"
    >
      <el-col :md="9">
        <el-input v-model.trim="form.name" />
      </el-col>
    </el-form-item>
    <el-form-item label="权限" prop="permissions">
      <div class="check-group-box">
        <div
          v-for="(group, index) in permissions"
          :key="index"
          class="cgb-panel"
        >
          <div class="cgb-head">
            <el-checkbox
              v-model="group.checkAll"
              :label="group.name"
              :indeterminate="group.checkIndeterminate"
              @change="onCheckAclAllChange(group)"
            />
          </div>
          <div class="cgb-body">
            <el-checkbox-group
              v-model="group.checkedPermissions"
              v-same-width="'el-checkbox'"
              @change="onCheckedPermissionGroupChange(group)"
            >
              <template v-for="(child, childIndex) in group.children">
                <el-checkbox
                  v-if="!child.children"
                  :key="index + '-' + childIndex"
                  :label="child.actionId"
                  :disabled="checkboxDisabled.includes(child.actionId)"
                  @change="
                    (checked) => onCheckedPermissionItemChange(checked, child)
                  "
                >
                  {{ child.name }}
                </el-checkbox>
                <div
                  v-if="child.children"
                  :key="index + '-' + childIndex"
                  class="cgb-line"
                >
                  <el-checkbox
                    v-for="(checkbox, checkboxIndex) in child.children"
                    :key="index + '-' + childIndex + '-' + checkboxIndex"
                    :label="checkbox.actionId"
                    :disabled="checkboxDisabled.includes(checkbox.actionId)"
                    @change="
                      (checked) =>
                        onCheckedPermissionItemChange(checked, checkbox)
                    "
                  >
                    {{ checkbox.name }}
                  </el-checkbox>
                </div>
              </template>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit" :loading="loading">
        {{ submitText }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import SameWidth from '@shared/directives/SameWidth'
import { useStore } from 'vuex'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { useForm } from '@shared/hooks/useForm'
import { ref, toRaw, onBeforeMount } from 'vue'

export default {
  directives: {
    sameWidth: SameWidth,
  },
  props: {
    submitText: {
      type: String,
      required: true,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    adminGroup: {
      type: Object,
      default: null,
    },
  },
  setup(props, { emit }) {
    const store = useStore()
    const httpClient = useHttpClient()

    const { loading, form, errors, setErrors, handleSubmit } = useForm(
      props.adminGroup
    )

    const formRef = ref()
    const permissions = ref([])
    const checkboxDisabled = ref([])

    const onSubmit = async () => {
      formRef.value.validate((valid) => {
        if (!valid) {
          return false
        }

        loading.value = true

        const checkedPermissions = []

        permissions.value.forEach((group) => {
          group.checkedPermissions.forEach((permission) => {
            checkedPermissions.push(permission)
          })
        })

        const formData = { ...toRaw(form), permissions: checkedPermissions }

        emit(
          'on-submit',
          formData,
          async () => {
            formRef.value.clearValidate()
            if (
              props.adminGroup.id ===
              store.getters['auth/getCurrentUser'].adminGroup.id
            ) {
              const { data } = await httpClient.get('auth/account', null, false)

              if (data) {
                await store.dispatch('auth/account', data)
              }
            }
          },
          async (error) => {
            await setErrors(error)
          },
          () => {
            loading.value = false
          }
        )
      })
    }

    const onCheckAclAllChange = (group) => {
      group.checkIndeterminate = false

      if (group.checkAll === true) {
        group.children.forEach((child) => {
          if (child.children) {
            child.children.forEach((item) => {
              group.checkedPermissions.push(item.actionId)
            })
          } else {
            group.checkedPermissions.push(child.actionId)
          }
        })
      } else {
        group.checkedPermissions = []
      }
    }

    const onCheckedPermissionGroupChange = (group) => {
      const checkedCount = group.checkedPermissions.length

      group.checkAll = group.permissionsCount === checkedCount
      group.checkIndeterminate =
        checkedCount > 0 && checkedCount < group.permissionsCount
    }

    const onCheckedPermissionItemChange = (checked, item) => {
      if (!item.combines || item.combines.length === 0) {
        return
      }

      if (!checked) {
        item.combines.forEach((combine) => {
          const matchIndex = checkboxDisabled.value.findIndex(
            (checkbox) => checkbox === combine
          )

          if (matchIndex > -1) {
            checkboxDisabled.value.splice(matchIndex, 1)
          }
        })

        return
      }

      item.combines.forEach((combine) => {
        if (!checkboxDisabled.value.includes(combine)) {
          checkboxDisabled.value.push(combine)
        }

        permissions.value.forEach((group) => {
          if (group.children && group.children.length > 0) {
            group.children.every((child) => {
              if (
                child.actionId &&
                child.actionId === combine &&
                !group.checkedPermissions.includes(combine)
              ) {
                group.checkedPermissions.push(combine)

                return true
              }

              if (child.children && child.children.length > 0) {
                child.children.every((aclItem) => {
                  if (
                    aclItem.actionId &&
                    aclItem.actionId === combine &&
                    !group.checkedPermissions.includes(combine)
                  ) {
                    group.checkedPermissions.push(combine)

                    return true
                  }

                  return true
                })
              }

              return true
            })
          }
        })
      })
    }

    const disableCombinesCheckbox = (item) => {
      if (!item.combines || item.combines.length === 0) {
        return
      }

      item.combines.forEach((combine) => {
        if (!checkboxDisabled.value.includes(combine)) {
          checkboxDisabled.value.push(combine)
        }
      })
    }

    const loadPermissions = async () => {
      const groupPermissions = props.adminGroup.permissions || []

      const { data } = await httpClient.get(
        'misc/admin-group-permissions',
        null,
        false
      )

      if (data) {
        data.forEach((permission) => {
          const group = {
            name: permission.name,
            checkAll: false,
            checkIndeterminate: false,
            checkedPermissions: [],
            permissionsCount: 0,
            children: permission.children,
          }

          permission.children.forEach((child) => {
            if (child.children) {
              child.children.forEach((item) => {
                group.permissionsCount++
                if (groupPermissions.includes(item.actionId)) {
                  group.checkedPermissions.push(item.actionId)
                  disableCombinesCheckbox(item)
                }
              })
            } else {
              group.permissionsCount++
              if (groupPermissions.includes(child.actionId)) {
                group.checkedPermissions.push(child.actionId)
                disableCombinesCheckbox(child)
              }
            }
          })

          const checkedCount = group.checkedPermissions.length

          group.checkAll = group.permissionsCount === checkedCount
          group.checkIndeterminate =
            checkedCount > 0 && checkedCount < group.permissionsCount

          permissions.value.push(group)
        })
      }
    }

    onBeforeMount(async () => {
      await loadPermissions()
    })

    return {
      loading,
      form,
      errors,
      formRef,
      handleSubmit,
      onSubmit,
      permissions,
      checkboxDisabled,
      onCheckAclAllChange,
      onCheckedPermissionGroupChange,
      onCheckedPermissionItemChange,
    }
  },
}
</script>

<style lang="less">
.check-group-box {
  line-height: 1;

  .cgb-panel {
    &:not(:last-child) {
      margin-bottom: 10px;
      padding-bottom: 3px;
    }

    .cgb-head {
      background-color: #f8f8f8;
      padding: 0 10px;
      line-height: 36px;
    }

    .cgb-body {
      padding: 7px 10px;
      line-height: 2;

      .el-checkbox {
        font-weight: normal;
      }
    }
  }
}
</style>
