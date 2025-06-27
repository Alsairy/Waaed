using AutoMapper;
using AttendancePlatform.Inventory.Api.Entities;
using AttendancePlatform.Inventory.Api.DTOs;

namespace AttendancePlatform.Inventory.Api.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Store, StoreDto>()
            .ForMember(dest => dest.ParentStoreName, opt => opt.MapFrom(src => src.ParentStore != null ? src.ParentStore.Name : null));
        CreateMap<CreateStoreDto, Store>();
        CreateMap<UpdateStoreDto, Store>();

        CreateMap<Item, ItemDto>()
            .ForMember(dest => dest.StoreName, opt => opt.MapFrom(src => src.Store.Name))
            .ForMember(dest => dest.PreferredSupplierName, opt => opt.MapFrom(src => src.PreferredSupplier != null ? src.PreferredSupplier.Name : null));
        CreateMap<CreateItemDto, Item>();
        CreateMap<UpdateItemDto, Item>();

        CreateMap<Supplier, SupplierDto>();
        CreateMap<CreateSupplierDto, Supplier>();
        CreateMap<UpdateSupplierDto, Supplier>();

        CreateMap<Indent, IndentDto>()
            .ForMember(dest => dest.StoreName, opt => opt.MapFrom(src => src.Store.Name));
        CreateMap<CreateIndentDto, Indent>();
        CreateMap<UpdateIndentDto, Indent>();

        CreateMap<IndentItem, IndentItemDto>()
            .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.Item.Name))
            .ForMember(dest => dest.ItemCode, opt => opt.MapFrom(src => src.Item.ItemCode))
            .ForMember(dest => dest.ItemUnit, opt => opt.MapFrom(src => src.Item.Unit));
        CreateMap<CreateIndentItemDto, IndentItem>()
            .ForMember(dest => dest.EstimatedTotalCost, opt => opt.MapFrom(src => src.EstimatedUnitCost * src.RequestedQuantity));

        CreateMap<PurchaseOrder, PurchaseOrderDto>()
            .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Supplier.Name));
        CreateMap<CreatePurchaseOrderDto, PurchaseOrder>();
        CreateMap<UpdatePurchaseOrderDto, PurchaseOrder>();

        CreateMap<PurchaseOrderItem, PurchaseOrderItemDto>()
            .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.Item.Name))
            .ForMember(dest => dest.ItemCode, opt => opt.MapFrom(src => src.Item.ItemCode))
            .ForMember(dest => dest.ItemUnit, opt => opt.MapFrom(src => src.Item.Unit));
        CreateMap<CreatePurchaseOrderItemDto, PurchaseOrderItem>()
            .ForMember(dest => dest.TotalPrice, opt => opt.MapFrom(src => CalculatePurchaseOrderItemTotal(src)))
            .ForMember(dest => dest.DiscountAmount, opt => opt.MapFrom(src => CalculateDiscountAmount(src)))
            .ForMember(dest => dest.TaxAmount, opt => opt.MapFrom(src => CalculateTaxAmount(src)));

        CreateMap<GoodsReceipt, GoodsReceiptDto>()
            .ForMember(dest => dest.PurchaseOrderNumber, opt => opt.MapFrom(src => src.PurchaseOrder != null ? src.PurchaseOrder.PONumber : null))
            .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Supplier.Name));
        CreateMap<CreateGoodsReceiptDto, GoodsReceipt>();
        CreateMap<UpdateGoodsReceiptDto, GoodsReceipt>();

        CreateMap<GoodsReceiptItem, GoodsReceiptItemDto>()
            .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.Item.Name))
            .ForMember(dest => dest.ItemCode, opt => opt.MapFrom(src => src.Item.ItemCode))
            .ForMember(dest => dest.ItemUnit, opt => opt.MapFrom(src => src.Item.Unit));
        CreateMap<CreateGoodsReceiptItemDto, GoodsReceiptItem>()
            .ForMember(dest => dest.TotalPrice, opt => opt.MapFrom(src => src.UnitPrice * src.ReceivedQuantity));

        CreateMap<Issue, IssueDto>()
            .ForMember(dest => dest.StoreName, opt => opt.MapFrom(src => src.Store.Name))
            .ForMember(dest => dest.IndentNumber, opt => opt.MapFrom(src => src.Indent != null ? src.Indent.IndentNumber : null))
            .ForMember(dest => dest.TransferToStoreName, opt => opt.MapFrom(src => src.TransferToStore != null ? src.TransferToStore.Name : null));
        CreateMap<CreateIssueDto, Issue>();
        CreateMap<UpdateIssueDto, Issue>();

        CreateMap<IssueItem, IssueItemDto>()
            .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.Item.Name))
            .ForMember(dest => dest.ItemCode, opt => opt.MapFrom(src => src.Item.ItemCode))
            .ForMember(dest => dest.ItemUnit, opt => opt.MapFrom(src => src.Item.Unit));
        CreateMap<CreateIssueItemDto, IssueItem>()
            .ForMember(dest => dest.TotalCost, opt => opt.MapFrom(src => src.UnitCost * src.IssuedQuantity));

        CreateMap<StockAdjustment, StockAdjustmentDto>()
            .ForMember(dest => dest.StoreName, opt => opt.MapFrom(src => src.Store.Name))
            .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.Item.Name))
            .ForMember(dest => dest.ItemCode, opt => opt.MapFrom(src => src.Item.ItemCode))
            .ForMember(dest => dest.ItemUnit, opt => opt.MapFrom(src => src.Item.Unit));
        CreateMap<CreateStockAdjustmentDto, StockAdjustment>()
            .ForMember(dest => dest.TotalCostImpact, opt => opt.MapFrom(src => src.UnitCost * src.AdjustmentQuantity));
        CreateMap<UpdateStockAdjustmentDto, StockAdjustment>()
            .ForMember(dest => dest.TotalCostImpact, opt => opt.MapFrom(src => src.UnitCost * src.AdjustmentQuantity));
    }

    private static decimal CalculatePurchaseOrderItemTotal(CreatePurchaseOrderItemDto src)
    {
        var subtotal = src.UnitPrice * src.OrderedQuantity;
        var discountAmount = src.DiscountPercentage.HasValue ? subtotal * (src.DiscountPercentage.Value / 100) : 0;
        var afterDiscount = subtotal - discountAmount;
        var taxAmount = src.TaxPercentage.HasValue ? afterDiscount * (src.TaxPercentage.Value / 100) : 0;
        return afterDiscount + taxAmount;
    }

    private static decimal? CalculateDiscountAmount(CreatePurchaseOrderItemDto src)
    {
        if (!src.DiscountPercentage.HasValue) return null;
        var subtotal = src.UnitPrice * src.OrderedQuantity;
        return subtotal * (src.DiscountPercentage.Value / 100);
    }

    private static decimal? CalculateTaxAmount(CreatePurchaseOrderItemDto src)
    {
        if (!src.TaxPercentage.HasValue) return null;
        var subtotal = src.UnitPrice * src.OrderedQuantity;
        var discountAmount = src.DiscountPercentage.HasValue ? subtotal * (src.DiscountPercentage.Value / 100) : 0;
        var afterDiscount = subtotal - discountAmount;
        return afterDiscount * (src.TaxPercentage.Value / 100);
    }
}
