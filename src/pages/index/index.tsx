import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Picker,
  Text,
  Image,
  Input,
  ScrollView,
} from "@tarojs/components";
import {
  AtInput,
  AtTextarea,
  AtList,
  AtListItem,
  AtButton,
  AtRadio,
  AtCheckbox,
  AtImagePicker,
} from "taro-ui";
import Taro, { useRouter } from "@tarojs/taro";
import _ from "lodash";
import "./index.scss";

function Index() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState("");
  const [assetsId, setAssetsId] = useState("");
  const [data, setData] = useState({});
  const [componentsOption, setComponentsOption] = useState({});
  const [components, setComponents] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [refresh, setRefresh] = useState("1");
  let apiUrl, imgUrl;
  if (process.env.NODE_ENV === "development") {
    apiUrl = "http://192.168.31.253:3000/api";
    imgUrl = "http://img.qiantur.com/";
  } else {
    apiUrl = "https://yyyw.qiantur.com/api";
    imgUrl = "http://img.qiantur.com/";
  }

  useEffect(() => {
    initTemplate();
  }, []);
  useEffect(() => {
    let result = [];
    _.toPairs(componentsOption).map((item) => {
      item?.[1] && result.push(pushComponent(item?.[1]));
    });
    setComponents(result);
  }, [refresh]);
  const randomId = (): string => {
    return _.random(0, 9999999, false);
  };
  const isJsonString = (str: string): boolean => {
    try {
      if (typeof JSON.parse(str) === "object") {
        return true;
      }
    } catch (error) {}
    return false;
  };
  const uploadImage = (label, file) => {
    Taro.uploadFile({
      url: apiUrl + "/oss/upload", //仅为示例，非真实的接口地址
      filePath: file.url,
      name: "file",
      success: (res) => {
        const returnInfo = isJsonString(res.data)
          ? JSON.parse(res.data)
          : undefined;
        if (returnInfo) {
          let files = data?.[label] ?? [];
          saveData(label, [...files, returnInfo.data.url]);
        }
      },
      fail: (err) => {
        console.log(err);
      },
    });
  };
  const initTemplate = () => {
    const url = decodeURIComponent(router?.params?.q);
    const strArray = url?.split("/");
    const urlParams = strArray?.[strArray.length - 1]?.split("&");
    let params = {};
    urlParams?.forEach((item) => {
      params[item.split("=")[0]] = item.split("=")[1];
    });

    setAssetsId(params?.assetsId);
    setCompanyId(params?.companyId);
    Taro.request({
      url: apiUrl + "/applet/template",
      method: "POST",
      data: {
        companyId: params?.companyId,
      },
      success: (res) => {
        let { data } = res?.data;
        let content = isJsonString(data?.content)
          ? JSON.parse(data?.content)
          : undefined;
        if (content) {
          setComponentsOption(content);
          let result = [];
          _.toPairs(content).map((item) => {
            item?.[1] && result.push(pushComponent(item?.[1]));
          });
          setComponents(result);
          setTemplateId(data._id);
        }
      },
      fail: (err) => {
        Taro.showToast({
          title: "网络请求错误",
          icon: "error",
          duration: 2000,
        });
      },
    });
  };
  const pushComponent = (component: any, index?: number) => {
    const {
      type,
      label,
      count,
      maxLength,
      hasRequired,
      options,
      maxDate,
      minDate,
    } = component;
    let formBox = {
      display: "flex",
      padding: 10,
      flexDirection: "column",
      borderBottomColor: "#D9D9D9",
      borderBottomWidth: 1,
      borderBottomStyle: "solid",
    };
    let labelBox = { marginBottom: 5 };
    let requiredIcon = { width: 14, height: 14, marginRight: 5 };
    let labelText = { fontSize: 18, color: "#000000" };

    let com;
    switch (type) {
      case "文字输入框":
        com = (
          <View style={formBox} key={randomId()}>
            <View style={labelBox}>
              {hasRequired && (
                <Image
                  src={require("../../assets/image/required.png")}
                  style={requiredIcon}
                />
              )}
              <Text style={labelText}>{label}</Text>
            </View>
            <Input
              type="text"
              focus={true}
              placeholder={`请输入${label}`}
              value={data[label]}
              maxlength={maxLength ? maxLength * 1 : 255}
              onInput={(event) => {
                saveData(label, event.detail.value);
              }}
            />
          </View>
        );
        break;
      case "数字输入框":
        com = (
          <View style={formBox} key={randomId()}>
            <View style={labelBox}>
              {hasRequired && (
                <Image
                  src={require("../../assets/image/required.png")}
                  style={requiredIcon}
                />
              )}
              <Text style={labelText}>{label}</Text>
            </View>
            <Input
              type="number"
              focus={true}
              placeholder={`请输入${label}`}
              value={data[label]}
              maxlength={maxLength ? maxLength * 1 : 255}
              onInput={(event) => {
                saveData(label, event.detail.value);
              }}
            />
          </View>
        );
        break;
      case "多行文字输入框":
        com = (
          <View style={formBox} key={randomId()}>
            <View style={labelBox}>
              {hasRequired && (
                <Image
                  src={require("../../assets/image/required.png")}
                  style={requiredIcon}
                />
              )}
              <Text style={labelText}>{label}</Text>
            </View>
            <Textarea
              autoHeight
              focus={true}
              placeholder={`请输入${label}`}
              value={data[label]}
              maxlength={maxLength ? maxLength * 1 : 255}
              onInput={(event) => {
                saveData(label, event.detail.value);
              }}
            />
          </View>
        );
        break;
      case "选择器":
        com = (
          <View style={formBox} key={randomId()}>
            <View style={labelBox}>
              {hasRequired && (
                <Image
                  src={require("../../assets/image/required.png")}
                  style={requiredIcon}
                />
              )}
              <Text style={labelText}>{label}</Text>
            </View>
            <Picker
              key={randomId()}
              mode="selector"
              range={options}
              rangeKey="label"
              onChange={(e) => {
                saveData(label, options?.[e.detail.value]?.value);
              }}
            >
              <AtList hasBorder={false}>
                <AtListItem
                  arrow="right"
                  hasBorder={false}
                  title={data[label] ?? `请输入${label}`}
                />
              </AtList>
            </Picker>
          </View>
        );
        break;
      case "单选框":
        com = (
          <View style={formBox} key={randomId()}>
            <View style={labelBox}>
              {hasRequired && (
                <Image
                  src={require("../../assets/image/required.png")}
                  style={requiredIcon}
                />
              )}
              <Text style={labelText}>{label}</Text>
            </View>
            <AtRadio
              options={options}
              value={data[label]}
              onClick={(value) => {
                saveData(label, value);
              }}
            />
          </View>
        );
        break;
      case "多选框":
        com = (
          <View style={formBox} key={randomId()}>
            <View style={labelBox}>
              {hasRequired && (
                <Image
                  src={require("../../assets/image/required.png")}
                  style={requiredIcon}
                />
              )}
              <Text style={labelText}>{label}</Text>
            </View>
            <AtCheckbox
              options={options}
              selectedList={data[label]}
              onChange={(value) => {
                saveData(label, value);
              }}
            />
          </View>
        );
        break;

      case "图片选择":
        let images = data[label] ?? [];
        let result = [];
        images.forEach((image) => {
          result.push({
            url: `${imgUrl}${image}`,
          });
        });
        com = (
          <View style={formBox} key={randomId()}>
            <View style={labelBox}>
              {hasRequired && (
                <Image
                  src={require("../../assets/image/required.png")}
                  style={requiredIcon}
                />
              )}
              <Text style={labelText}>{label}</Text>
            </View>
            <AtImagePicker
              count={count}
              files={result}
              onChange={(files, operationType, index) => {
                if (operationType === "add") {
                  uploadImage(label, files[files.length - 1]);
                } else {
                  _.remove(data[label] ?? [], (item, i) => i === index);
                  saveData(label, data[label]);
                }
              }}
            />
          </View>
        );
        break;
      case "日期选择":
        com = (
          <View style={formBox} key={randomId()}>
            <View style={labelBox}>
              {hasRequired && (
                <Image
                  src={require("../../assets/image/required.png")}
                  style={requiredIcon}
                />
              )}
              <Text style={labelText}>{label}</Text>
            </View>
            <Picker
              key={randomId()}
              mode="date"
              start={minDate}
              end={maxDate}
              range={options}
              rangeKey="label"
              onChange={(e) => {
                saveData(label, options?.[e.detail.value]?.value);
              }}
            >
              <AtList hasBorder={false}>
                <AtListItem
                  arrow="right"
                  hasBorder={false}
                  title={data[label] ?? `请输入${label}`}
                />
              </AtList>
            </Picker>
          </View>
        );
        break;
      default:
        break;
    }
    return { label, com };
  };
  const saveData = (label: string, value: any) => {
    setData(Object.assign(data, { [label]: value }));
    setRefresh(randomId());
  };
  const reportFault = (code) => {
    let flag = false;
    _.toPairs(componentsOption).map((item) => {
      if (item[1].hasRequired && !data[item[0]]) {
        Taro.showToast({
          icon: "error",
          title: `${item[0]}不能为空`,
          duration: 2000,
        });
        flag = true;
      }
      if (item[1].maxLength && data[item[0]]?.length > item[1].maxLength) {
        Taro.showToast({
          icon: "error",
          title: `${item[0]}已超过最大长度${item[1].maxLength}`,
          duration: 2000,
        });
        flag = true;
      }
    });
    if (flag) {
      return;
    }
    Taro.showLoading({
      title: "上报中...",
    });
    Taro.request({
      url: apiUrl + "/applet/reportFault",
      method: "POST",
      data: {
        templateId,
        data,
        assetsId,
        code,
      },
      success: (res) => {
        let { data } = res.data;
        Taro.hideLoading();
        Taro.showToast({
          title: "稍后会与您联系",
          icon: "success",
          duration: 2000,
        });
      },
      fail: (err) => {
        Taro.showToast({
          title: "网络请求错误",
          icon: "error",
          duration: 2000,
        });
      },
    });
  };

  return (
    <ScrollView className="index">
      {components.map((item, key) => {
        return <View key={key}>{item?.com}</View>;
      })}
      {!companyId && (
        <Text style={{ fontSize: 18, color: "#000000" }}>
          使用微信扫一扫，扫描资产二维码进行故障上报
        </Text>
      )}
      {companyId && (
        <AtButton
          type="primary"
          openType="getPhoneNumber"
          onGetPhoneNumber={(event) => {
            companyId && reportFault(event.detail.code);
          }}
        >
          提交
        </AtButton>
      )}
    </ScrollView>
  );
}

export default Index;
