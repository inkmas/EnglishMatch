<!-- src/components/VocabUpload.vue -->
<template>
  <div class="vocab-upload-container">
    <!-- 文件上传核心区域 -->
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
      <div class="el-upload__tip" slot="tip">
        <div>仅支持TXT文件，格式为：<code>单词=释义</code>（每行一组）</div>
        <div class="example-text">示例：attribute v.=归因于</div>
      </div>
    </el-upload>

    <!-- 上传状态提示 -->
    <div v-if="uploadStatus" class="upload-status">
      <el-tag :type="uploadStatus.type" closable @close="uploadStatus = null">
        {{ uploadStatus.message }}
      </el-tag>
    </div>

    <!-- 已导入词汇列表预览（可选） -->
    <div v-if="vocabStore.vocabList.length" class="vocab-preview">
      <div class="preview-title">
        <el-icon><List /></el-icon>
        已导入词汇（{{ vocabStore.vocabList.length }}组）
        <el-button
            type="text"
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
    </div>  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElUpload, ElTag, ElButton, ElIcon, ElMessage } from 'element-plus';
import { UploadFilled, List } from '@element-plus/icons-vue';
// 引入Pinia词汇仓库
import { useVocabStore } from '@/stores/vocab';
import type { VocabItem } from '@/stores/vocab';

// 初始化Pinia
const vocabStore = useVocabStore();

// 响应式状态
const fileList = ref<any[]>([]); // 上传文件列表
const uploadStatus = ref<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null); // 上传状态提示

// 上传前校验：仅允许TXT文件
const beforeUpload = (file: File) => {
  const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
  if (!isTxt) {
    ElMessage.error('仅支持上传TXT纯文本文件！');
    return false;
  }
  const isLt1M = file.size / 1024 / 1024 < 1; // 限制文件大小1MB内
  if (!isLt1M) {
    ElMessage.error('文件大小不能超过1MB！');
    return false;
  }
  return true;
};

// 解析TXT文件：核心逻辑（处理「单词=释义」格式）
const parseTxtFile = async (file: File): Promise<VocabItem[]> => {
  try {
    const content = await file.text();
    const lines = content.split('\n').filter(line => line.trim()); // 过滤空行
    const vocabList: VocabItem[] = [];
    let errorLineCount = 0;

    lines.forEach((line, lineNum) => {
      const splitIndex = line.indexOf('=');
      // 格式校验
      if (splitIndex === -1) {
        errorLineCount++;
        return;
      }
      // 分割并去除首尾空格
      const en = line.slice(0, splitIndex).trim();
      const cn = line.slice(splitIndex + 1).trim();
      // 过滤空值
      if (!en || !cn) {
        errorLineCount++;
        return;
      }
      vocabList.push({ en, cn });
    });

    // 提示错误行数
    if (errorLineCount > 0) {
      uploadStatus.value = {
        type: 'warning',
        message: `共解析${lines.length}行，其中${errorLineCount}行格式错误（未找到=或内容为空）`
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

// 处理文件选择：解析并更新Pinia
const handleFileChange = async (uploadFile: any) => {
  const file = uploadFile.raw;
  if (!file) return;

  try {
    // 解析文件
    const newVocabList = await parseTxtFile(file);
    // 更新Pinia词汇列表（覆盖原有数据）
    vocabStore.setVocabList(newVocabList);
    // 提示成功
    uploadStatus.value = {
      type: 'success',
      message: `✅ 成功导入 ${newVocabList.length} 组词汇`
    };
    // 记录已上传文件
    fileList.value = [uploadFile];
  } catch (error) {
    // 提示失败
    uploadStatus.value = {
      type: 'error',
      message: (error as Error).message
    };
    fileList.value = [];
  }
};

// 移除上传的文件
const handleFileRemove = () => {
  fileList.value = [];
  uploadStatus.value = null;
};

// 清空所有词汇
const clearVocab = () => {
  vocabStore.clearVocabList();
  fileList.value = [];
  uploadStatus.value = {
    type: 'info',
    message: '已清空所有导入的词汇'
  };
};

// 移除单个词汇
const removeVocab = (index: number) => {
  const newList = [...vocabStore.vocabList];
  newList.splice(index, 1);
  vocabStore.setVocabList(newList);
  uploadStatus.value = {
    type: 'info',
    message: `已移除词汇：${vocabStore.vocabList[index]?.en || ''}`
  };
};
</script>

<style scoped>
/* 容器样式 */
.vocab-upload-container {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

/* 上传按钮区域 */
.upload-btn-wrapper {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

/* 上传提示文本 */
.example-text {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
}

/* 上传状态提示 */
.upload-status {
  margin-top: 15px;
  text-align: center;
}

/* 词汇预览区域 */
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

.clear-btn {
  color: #909399;
  font-size: 0.9rem;
}

/* 词汇标签列表 */
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
  border: 1px solid #e6e6e6;
}

/* 词汇文本样式 */
.en-text {
  color: #409eff;
  font-weight: 500;
  margin-right: 5px;
}

.separator {
  color: #999;
  margin: 0 5px;
}

.cn-text {
  color: #67c23a;
}

/* 滚动条样式优化 */
.vocab-list::-webkit-scrollbar {
  width: 6px;
}

.vocab-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .vocab-upload-container {
    padding: 15px;
  }

  .vocab-tag {
    font-size: 0.9rem;
    padding: 6px 10px;
  }
}
</style>