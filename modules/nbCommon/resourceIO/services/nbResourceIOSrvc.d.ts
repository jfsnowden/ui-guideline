/**
 * Resource Export/Import service
 */
interface nbResourceIOSrvc {
    /**
     * 导出一个Resource及依赖的所有Resource
     * @param {IResourceKey} resourceKey 要导出的Resource Key对象，拥有C#中定义的ResourceKey相同的成员，并多一个type成员存储resource type Name
     * @param {IExportOptions} options 导出配置对象
     * @returns {Promise<IExportResult>} 当整个导出过程结束后promise结束
     */
    exportOne(resourceKey: IResourceKey, options: IExportOptions): Promise<IExportResult>;
    /**
     * 导出多个Resource及依赖的所有Resource
     * @param {IResourceKey[]} resourceKeys 要导出的Resource Key对象数组，拥有C#中定义的ResourceKey相同的成员，并多一个type成员存储resource type Name
     * @param {IExportOptions} options 导出配置对象
     * @returns {Promise<IExportResult>} 当整个导出过程结束后promise结束
     */
    exportMulti(resourceKeys: IResourceKey[], options: IExportOptions): Promise<IExportResult>;
    /**
     * 弹出Resource导入对话框，导入对话框内部实现了导入功能
     * @param {string} resourceTypeName 要导入Resource type name，需与服务端定义的Resouce type name一致
     * @param {IImportOptions} options 导入配置对象
     * @returns {Promise<IImportResult[]>} 当整个导入过程结束后promise结束，导入时用户可能选择了多个Package上传，故回调参数为IImportResult数组，每个Package对应一项
     */
    openImportDialog(resourceTypeName: string, options: IImportOptions): Promise<IImportResult[]>;
}

/**
 * resource key 对象
 */
interface IResourceKey {
    /**
     * resource type Name
     */
    type: string;
    /**
     * qapp,qapp group,runbook,parser将拥有此成员
     */
    path?: string;
    /**
     * variable mapping拥有此成员，parser path
     */
    parserPath?: string;
    /**
     * variable mapping拥有此成员，parser 中variable fullname
     */
    varFullName?: string;
}

/**
 * 导出配置对象
 */
interface IExportOptions {
    /**
     * 导出类型，默认为1
     * 1：针对每个要导出的资源(一个key代表一个资源)生成一个Package(包括其依赖的所有资源)，如果有多个，则在针对所有Package压缩为一个zip；
     * 2：所有要导出的资源及所有依赖的资源整体生成一个Package。
     */
    exportType?: number,
    /**
     * 附加参数字典对象，一个key/value字典，每个value可以是任何合法的json值，非framework必须数据，用于向Handler内传递特定参数;
     * 具体的key/value数据类型与内容应由前后端开发人员预先约定好；
     * 服务端Handler.Export中可通过IExportJobContext.AttachedParameter获取；
     * 从通用性的角度来考虑，未来导出的调用方式可能多样化，服务端的Handler实现不应强依赖该数据，
     * 仅应依赖该数据做导出的可选非必须逻辑，如果该数据为空Handler也应可以正常导出。
     */
    attachedParameter: Object,
    /**
     * 导出文件名，不包括后缀，如果没设置将按如下规则生成：
     * 只包含一个主资源时：使用第一个主资源名；
     * 包含多个主资源时：使用"multiResources"。
     */
    exportFileName?: string,
    /**
     * Package文件的后缀名，后缀需要带“.”，如果没设置将使用主资源类型的默认后缀；
     * 在两种情况下该值才会生效, 1:exportType==1且只导出1个主资源,2:exportType==2；
     * 不允许用".zip"，".zip"是保留后缀，Framework会在exportType==1且导出多个主资源时将多个Package压缩为一个zip。
     */
    packageFileSuffix?: string
}

interface IImportOptions {
    /**
     * 允许的Resouce包文件后缀数组，后缀需要带“.”，“*”代表任意后缀名
     */
    allowedPackageFileSuffix: string[];
    /**
     * 依赖资源列是否可见，如parser因是最后一级，应给false，默认为true
     */
    isVisibleRelatedResource?: boolean;
    /**
     * 主窗口大小，为空时框架按默认大小显示
     */
    mainDialogSize?: IDialogSize;
    /**
     * 关联资源窗口大小，为空时框架按默认大小显示
     */
    relatedDialogSize?: IDialogSize;
    /**
     * 期望导入的位置，用户导入时选中的Folder路径
     */
    expectedImportLocation: IImportLocation;

    /**
     * 附加参数字典对象，一个key/value字典，每个value可以是任何合法的json值，非framework必须数据，用于向Handler内传递特定参数;
     * 具体的key/value数据类型与内容应由前后端开发人员预先约定好；
     * 服务端Handler.Import中可通过IImportJobContext.AttachedParameter获取；
     * 从通用性的角度来考虑，未来导入的调用方式可能多样化，服务端的Handler实现不应强依赖该数据，
     * 仅应依赖该数据做导入的可选非必须逻辑，如果该数据为空Handler也应可以正常导入。
     */
    attachedParameter: Object
}

interface IDialogSize {
    /**
     * 宽度
     */
    width: number,
    /**
     * 高度
     */
    height: number
}

interface IImportLocation {
    /**
     * 资源导入空间，1：Built In，2：Shared in Company，4：Shared in Tenant，8：My Files
     */
    space: number,
    /**
     * 资源导入位置，比如"/Runbook1/"，前不包含空间
     */
    location: string
}


interface IJobResult {
    /**
     * 结果状态，3：顺利完成；4：错误结束；5：已被取消
     */
    status: number,
    /**
     * 错误编码，如果status==4时有效
     */
    errorCode?: number,
    /**
     * 错误信息，如果status==4时有效
     */
    errorMsg?: string,
    /**
     * 附加结果字典对象，一个key/value字典，每个value可能是任何合法的json值，非framework必须数据，用于Handler内向外返回特定的结果数据；
     * 当status==3时有效；
     * 具体的key/value数据类型与内容应由前后端开发人员预先约定好；
     * 服务端Handler.Import中可通过IImportJobContext.AttachedResult设置；
     */
    attachedResult: Object

}

interface IExportResult extends IJobResult {
}

interface IImportResult extends IJobResult {
    /**
     * 导入成功的resource key 数组，不包括连带导入的Resource
     */
    importedResourceKeys: IResourceKey[]

}