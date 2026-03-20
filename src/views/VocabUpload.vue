<template>
  <div class="vocab-upload-container">
    <el-upload
        class="upload-btn-wrapper"
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        :before-upload="beforeUpload"
        accept=".txt"
        :limit="1"
        :file-list="fileList"
        drag
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        拖放文件到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          <div>仅支持TXT文件，格式为：<code>单词=释义</code>（每行一组）</div>
          <div class="example-text">示例：attribute v.=归因于</div>
        </div>
      </template>
    </el-upload>

    <div v-if="uploadStatus" class="upload-status">
      <el-tag :type="uploadStatus.type" closable @close="uploadStatus = null">
        {{ uploadStatus.message }}
      </el-tag>
    </div>

    <div v-if="vocabStore.vocabList.length" class="vocab-preview">
      <div class="preview-title">
        <div style="display: flex; align-items: center; gap: 5px;">
          <el-icon><List /></el-icon>
          <span>已导入词汇（{{ vocabStore.vocabList.length }}组）</span>
        </div>
        <el-button
            type="primary"
            link
            size="small"
            @click="clearVocab"
            class="clear-btn"
        >
          清空
        </el-button>
      </div>
      <div class="vocab-list">
        <el-tag
            v-for="(item, index) in vocabStore.vocabList"
            :key="index"
            closable
            @close="removeVocab(index)"
            effect="light"
            class="vocab-tag"
        >
          <span class="en-text">{{ item.en }}</span>
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElUpload, ElTag, ElButton, ElIcon, ElMessage } from 'element-plus';
import { UploadFilled, List } from '@element-plus/icons-vue';
import { useVocabStore } from '@/stores/vocab';
import type { VocabItem } from '@/stores/vocab';

const vocabStore = useVocabStore();

const fileList = ref<any[]>([]);
const uploadStatus = ref<{
  type: 'success' | 'warning' | 'info' | 'error' | 'primary' | 'danger' | any;
  message: string
} | null>(null);

const beforeUpload = (file: File) => {
  const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
  if (!isTxt) {
    ElMessage.error('仅支持上传TXT纯文本文件！');
    return false;
  }
  const isLt1M = file.size / 1024 / 1024 < 1;
  if (!isLt1M) {
    ElMessage.error('文件大小不能超过1MB！');
    return false;
  }
  return true;
};

const parseTxtFile = async (file: File): Promise<VocabItem[]> => {
  try {
    const content = await file.text();
    const lines = content.split('\n').filter(line => line.trim());
    const vocabList: VocabItem[] = [];
    let errorLineCount = 0;

    lines.forEach((line) => {
      const splitIndex = line.indexOf('=');
      if (splitIndex === -1) {
        errorLineCount++;
        return;
      }
      const en = line.slice(0, splitIndex).trim();
      const cn = line.slice(splitIndex + 1).trim();
      if (!en || !cn) {
        errorLineCount++;
        return;
      }
      vocabList.push({ en, cn });
    });

    if (errorLineCount > 0) {
      uploadStatus.value = {
        type: 'warning',
        message: `共解析${lines.length}行，其中${errorLineCount}行格式错误`
      };
    }

    if (vocabList.length === 0) {
      throw new Error('未解析到有效词汇，请检查文件格式！');
    }
    return vocabList;
  } catch (error) {
    throw new Error(`文件解析失败：${(error as Error).message}`);
  }
};

const handleFileChange = async (uploadFile: any) => {
  const file = uploadFile.raw;
  if (!file) return;

  try {
    const newVocabList = await parseTxtFile(file);
    vocabStore.setVocabList(newVocabList);
    uploadStatus.value = {
      type: 'success',
      message: `成功导入 ${newVocabList.length} 组词汇`
    };
    fileList.value = [uploadFile];
  } catch (error) {
    uploadStatus.value = {
      type: 'error',
      message: (error as Error).message
    };
    fileList.value = [];
  }
};

const handleFileRemove = () => {
  fileList.value = [];
  uploadStatus.value = null;
};

const clearVocab = () => {
  vocabStore.clearVocabList();
  fileList.value = [];
  uploadStatus.value = {
    type: 'info',
    message: '已清空所有导入的词汇'
  };
};

const removeVocab = (index: number) => {
  // 💡 修复点：先保存名称再删除，防止索引越界报错
  const removedName = vocabStore.vocabList[index]?.en || '';
  const newList = [...vocabStore.vocabList];
  newList.splice(index, 1);
  vocabStore.setVocabList(newList);
  uploadStatus.value = {
    type: 'info',
    message: `已移除词汇：${removedName}`
  };
};
</script>

<style scoped>
.vocab-upload-container {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.upload-btn-wrapper {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.example-text {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
}

.upload-status {
  margin-top: 15px;
  text-align: center;
}

.vocab-preview {
  margin-top: 20px;
  border-top: 1px dashed #e6e6e6;
  padding-top: 20px;
}

.preview-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 500;
  color: #333;
}

.vocab-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 5px;
}

.vocab-tag {
  padding: 8px 12px;
  background: #fff;
}

.en-text {
  color: #409eff;
  font-weight: 500;
}

.vocab-list::-webkit-scrollbar {
  width: 6px;
}

.vocab-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}
</style>