/**
 * kidtour 插件通信工具
 * 插件协议 v1.2
 *
 * 使用方式（示例）：
 *   import { sendComplete } from './useKidtourPlugin.js'
 *
 *   // 训练型（只上报是否通关）
 *   sendComplete({ passed: true })
 *
 *   // 创作型（音频作品）
 *   sendComplete({ passed: true, workFile: audioBlob, workFileType: 'audio/webm', workFileName: '我的古琴小曲' })
 *
 *   // 创作型（图片作品）
 *   sendComplete({ passed: true, workFile: imageBlob, workFileType: 'image/png', workFileName: '我的篆刻作品' })
 */

/**
 * 向平台宿主上报游戏完成结果
 * @param {object}           options
 * @param {boolean}          options.passed        - 必填：是否通关/完成
 * @param {Blob|ArrayBuffer} options.workFile      - 可选：作品文件（图片/音频），非创作类不传
 * @param {string}           options.workFileType  - workFile 存在时必填：文件 MIME 类型
 *                                                   如 'audio/webm'、'audio/wav'、'image/png'
 * @param {string}           options.workFileName  - 可选：作品名称，不填则宿主使用默认名"{非遗名}作品"
 */

export const sendComplete = async ({
  passed,
  workFile = null,
  workFileType = null,
  workFileName = null,
}) => {
  // passed 校验
  if (typeof passed !== "boolean") {
    console.error("[kidtour-plugin] sendComplete 错误：passed 必须是 boolean");
    return;
  }

  // workFile 与 workFileType 联动校验
  if (workFile !== null && !workFileType) {
    console.error(
      "[kidtour-plugin] sendComplete 错误：传入 workFile 时 workFileType 为必填",
    );
    return;
  }
  if (workFileType !== null && !workFile) {
    console.warn(
      "[kidtour-plugin] sendComplete 警告：传入了 workFileType 但 workFile 为空，workFileType 将被忽略",
    );
    workFileType = null;
  }

  // 将 Blob 统一转为 ArrayBuffer（postMessage Transferable 要求）
  let transferable = null;
  let arrayBuffer = null;

  if (workFile !== null) {
    try {
      if (workFile instanceof Blob) {
        arrayBuffer = await workFile.arrayBuffer();
      } else if (workFile instanceof ArrayBuffer) {
        arrayBuffer = workFile;
      } else {
        console.error(
          "[kidtour-plugin] sendComplete 错误：workFile 必须是 Blob 或 ArrayBuffer",
        );
        return;
      }
      transferable = [arrayBuffer];
    } catch (err) {
      console.error("[kidtour-plugin] sendComplete 错误：文件读取失败", err);
      return;
    }
  }

  const message = {
    source: "kidtour-plugin", // 固定，不要修改
    type: "COMPLETE", // 固定，不要修改
    payload: {
      passed,
      workFile: arrayBuffer,
      workFileType,
      workFileName,
    },
  };

  // console.log('发送前 buffer 大小:', arrayBuffer?.byteLength);
  // 有文件时使用 Transferable 避免内存翻倍
  if (transferable) {
    window.parent.postMessage(message, "*", transferable);
  } else {
    window.parent.postMessage(message, "*");
  }

  console.log("[kidtour-plugin] 已上报结果：", {
    passed,
    workFileType,
    workFile: arrayBuffer
      ? `[ArrayBuffer ${arrayBuffer.byteLength} bytes]`
      : null,
    workFileName,
  });
};
