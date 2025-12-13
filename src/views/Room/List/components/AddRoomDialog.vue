<template>
  <el-dialog
    v-model="visible"
    :title="isEditMode ? '编辑房间' : '新增房间'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="房间号" prop="roomNo">
        <el-input v-model="form.roomNo" placeholder="例如：A101" :disabled="isEditMode" />
      </el-form-item>
      <el-form-item label="房间分类" prop="roomType">
        <el-select v-model="form.roomType" placeholder="请选择房间分类">
          <el-option label="客房" :value="1" />
          <el-option label="短住" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="房间类型" prop="gender">
        <el-select v-model="form.gender" placeholder="男众女众" @change="handleGenderChange">
          <el-option label="男众" :value="1" />
          <el-option label="女众" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="楼层" prop="floor">
        <el-select v-model="form.floor" placeholder="请选择楼层" :loading="loadingFloors">
          <el-option v-for="floor in floorList" :key="floor" :label="`${floor}层`" :value="floor" />
        </el-select>
      </el-form-item>
      <el-form-item label="房间状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择房间状态">
          <el-option label="使用中" :value="1" />
          <el-option label="关闭中" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="房间描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入房间描述"
          resize="none"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">保存房间</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createRoom, updateRoom, type CreateRoomRequest } from '@/api/room'
import { getFloors } from '@/api/assignment'
import type { RoomSummaryVO } from '@/types/room'

const props = defineProps<{
  modelValue: boolean
  isEditMode: boolean
  roomData?: RoomSummaryVO | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

const formRef = ref<FormInstance>()
const loadingFloors = ref(false)
const submitting = ref(false)
const floorList = ref<number[]>([])

const form = reactive({
  id: 0,
  roomNo: '',
  gender: 1,
  roomType: 1,
  floor: 1,
  status: 1,
  description: ''
})

const rules: FormRules = {
  roomNo: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择房间类型', trigger: 'change' }],
  roomType: [{ required: true, message: '请选择房间类型', trigger: 'change' }],
  floor: [{ required: true, message: '请选择楼层', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: 0,
    roomNo: '',
    gender: 1,
    roomType: 1,
    floor: 1,
    status: 1,
    description: ''
  })
}

const loadFloorsByGender = async (gender: number) => {
  loadingFloors.value = true
  try {
    const response = await getFloors({ gender })
    floorList.value = response || []
    if (!props.isEditMode) {
      form.floor = floorList.value[0] || form.floor
    }
  } catch (error) {
    console.error('获取楼层列表失败:', error)
    floorList.value = []
  } finally {
    loadingFloors.value = false
  }
}

const initForm = async () => {
  resetForm()
  if (props.isEditMode && props.roomData) {
    Object.assign(form, {
      id: props.roomData.id || 0,
      roomNo: props.roomData.roomNo || '',
      gender: props.roomData.gender || 1,
      roomType: props.roomData.roomType || 1,
      floor: props.roomData.floor || 1,
      status: props.roomData.status || 1,
      description: props.roomData.description || ''
    })
  }
  await loadFloorsByGender(form.gender)
}

const handleGenderChange = async (val: number) => {
  await loadFloorsByGender(val)
}

const handleClose = () => {
  resetForm()
  emit('update:modelValue', false)
}

const submit = async () => {
  if (!formRef.value) return
  formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload: CreateRoomRequest = {
        roomNo: form.roomNo,
        gender: form.gender,
        roomType: form.roomType,
        floor: form.floor,
        status: form.status,
        description: form.description || undefined
      }

      if (props.isEditMode && form.id) {
        await updateRoom(payload)
        ElMessage.success('房间更新成功')
      } else {
        await createRoom(payload)
        ElMessage.success('房间添加成功')
      }
      handleClose()
      emit('success')
    } catch (error) {
      console.error('保存房间失败:', error)
      ElMessage.error(props.isEditMode ? '房间更新失败，'+error : '房间添加失败，'+error)
    } finally {
      submitting.value = false
    }
  })
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      initForm()
    }
  }
)
</script>
